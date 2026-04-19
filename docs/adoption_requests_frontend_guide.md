# Adoption Requests — Frontend Implementation Guide

## Overview

This document covers everything needed to implement the adoption request flow in the mobile app using Supabase.

---

## Database Schema Reference

```
adoption_requests
├── id              uuid
├── pet_id          uuid → pets.id
├── requester_id    uuid → profiles.id
├── owner_id        uuid → profiles.id
├── status          text  → 'pending' | 'accepted' | 'declined'
├── requester_note  text? (optional message from requester)
├── owner_note      text? (optional on accept, required by system on auto-decline)
├── created_at      timestamp
└── updated_at      timestamp
```

```
pets.status → 'available' | 'reserved' | 'adopted'
```

---

## RPC Functions

All actions go through Supabase RPC functions — never write directly to the table.

| Function | Called By | Description |
|---|---|---|
| `send_adoption_request` | Requester | Send a new adoption request |
| `accept_adoption_request` | Owner | Accept a request, auto-declines others |
| `decline_adoption_request` | Owner | Decline a specific request |
| `cancel_adoption_request` | Requester | Deletes the pending request row |
| `mark_pet_adopted` | Owner | Marks pet as fully adopted |
| `reopen_pet_offer` | Owner | Re-opens pet to available, deletes accepted request |

---

## RPC Usage

### Send Adoption Request
```dart
final result = await supabase.rpc('send_adoption_request', params: {
  'p_pet_id': petId,
  'p_requester_note': note, // nullable
});
// result = { success: true } or { success: false, error: '...' }
```

**Possible errors:**
- `'Pet not found'`
- `'You cannot request your own pet'`
- `'This pet is no longer available'`
- `'You already have an active request for this pet'`

---

### Accept Adoption Request
```dart
final result = await supabase.rpc('accept_adoption_request', params: {
  'p_request_id': requestId,
  'p_owner_note': note, // nullable
});
```

**Side effects (handled server-side):**
- All other `pending` requests for the same pet → auto `declined` with message: `"Another adoption request was accepted for this pet."`
- `pets.status` → `'reserved'`

---

### Decline Adoption Request
```dart
final result = await supabase.rpc('decline_adoption_request', params: {
  'p_request_id': requestId,
  'p_owner_note': note, // nullable
});
```

---

### Cancel Adoption Request
```dart
final result = await supabase.rpc('cancel_adoption_request', params: {
  'p_request_id': requestId,
});
```
> ⚠️ This **deletes** the row entirely — there is no `cancelled` status.

---

### Mark Pet as Adopted
```dart
final result = await supabase.rpc('mark_pet_adopted', params: {
  'p_pet_id': petId,
});
// pets.status → 'adopted'
```

---

### Re-open Pet Offer
```dart
final result = await supabase.rpc('reopen_pet_offer', params: {
  'p_pet_id': petId,
});
// Deletes the accepted request row
// pets.status → 'available'
```

---

## Querying Requests

### Get My Sent Requests (Requester view)
```dart
final requests = await supabase
  .from('adoption_requests')
  .select('''
    *,
    pet:pets (
      id, name, species, images, status
    )
  ''')
  .eq('requester_id', supabase.auth.currentUser!.id)
  .order('created_at', ascending: false);
```

### Get My Received Requests (Owner view)
```dart
final requests = await supabase
  .from('adoption_requests')
  .select('''
    *,
    pet:pets (
      id, name, species, images, status
    ),
    requester:profiles (
      id, name, avatar_url, phone
    )
  ''')
  .eq('owner_id', supabase.auth.currentUser!.id)
  .order('created_at', ascending: false);
```

### Check if current user has an active request for a specific pet
```dart
final existing = await supabase
  .from('adoption_requests')
  .select('id, status')
  .eq('pet_id', petId)
  .eq('requester_id', supabase.auth.currentUser!.id)
  .inFilter('status', ['pending', 'accepted'])
  .maybeSingle();

// existing == null → no active request → show "Adopt Me"
// existing != null → show status badge
```

---

## Screen-by-Screen Implementation

---

### 1. Pet Detail Screen

**Logic on load:**
1. Fetch pet details
2. Check if current user is the owner (`pet.posted_by == currentUser.id`) → hide CTA
3. Check if current user already has an active request for this pet

**CTA Button States:**

| Condition | Button |
|---|---|
| `pet.status == 'available'` + no active request | `Adopt Me` (red/primary) |
| Active request with `status == 'pending'` | `Request Pending` (disabled, show "Waiting for owner response") |
| Active request with `status == 'accepted'` | `Request Accepted` (green, disabled) |
| Active request with `status == 'declined'` | `Request Declined` + optionally show `owner_note` |
| `pet.status == 'reserved'` + no request from user | `No Longer Available` (disabled) |
| `pet.status == 'adopted'` | `Already Adopted` (disabled) |
| Current user is owner | Hide CTA entirely |

**Adopt Me Bottom Sheet:**
- Optional text field: "Add a personal note (optional)"
- Cancel button
- Send Request button → calls `send_adoption_request`
- On success → update local state to show `Request Pending`
- On error → show error message (e.g. "This pet is no longer available")

---

### 2. Requests Screen (Profile)

Two tabs: **Sent** | **Received**

#### Sent Tab (Requester view)

Each card shows:
- Pet image + name + species
- Status badge: `Pending` (yellow) | `Accepted` (green) | `Declined` (red)
- `owner_note` if declined
- If `pending` → show Cancel button (calls `cancel_adoption_request`, removes row from list)

#### Received Tab (Owner view)

Each card shows:
- Pet image + name
- Requester name + avatar
- `requester_note` if present
- `created_at` date
- Three action buttons (only when `status == 'pending'`):
  - **Chat** → navigate to chat with requester
  - **Accept** → show confirmation modal with optional note → calls `accept_adoption_request`
  - **Decline** → show confirmation modal with optional note → calls `decline_adoption_request`
- If `status == 'accepted'` → show accepted badge + option to mark as adopted

---

### 3. My Pets Screen (Owner view)

Each pet card shows pet status badge: `Available` | `Reserved` | `Adopted`

For pets with `status == 'reserved'`:
- Show how many requests were received
- Button to view accepted request
- Button to mark as adopted → calls `mark_pet_adopted`

For pets with `status == 'adopted'`:
- Show "Re-open offer" option → calls `reopen_pet_offer` with confirmation dialog

---

## Status Flow Summary

```
[Requester]  (no row)  ──► pending      via send_adoption_request
[Requester]  pending   ──► (deleted)    via cancel_adoption_request
[Owner]      pending   ──► accepted     via accept_adoption_request
                              └──► all other pending for same pet ──► declined (auto)
                              └──► pet.status = 'reserved'
[Owner]      pending   ──► declined     via decline_adoption_request
[Owner]      reserved  ──► adopted      via mark_pet_adopted (pet.status = 'adopted')
[Owner]      adopted   ──► available    via reopen_pet_offer (deletes accepted request)
```

---

## Realtime (Optional but Recommended)

Subscribe to request changes so UI updates without manual refresh.

```dart
// On pet detail screen — update CTA in real time
supabase
  .from('adoption_requests')
  .stream(primaryKey: ['id'])
  .eq('pet_id', petId)
  .eq('requester_id', currentUserId)
  .listen((data) {
    // update local request state
  });

// On received requests tab — refresh when new request comes in
supabase
  .from('adoption_requests')
  .stream(primaryKey: ['id'])
  .eq('owner_id', currentUserId)
  .listen((data) {
    // refresh received list
  });
```

---

## Error Handling Pattern

All RPCs return `{ success: bool, error?: string }`. Use a consistent handler:

```dart
Future<void> handleRpc(Map result, {required String successMessage}) {
  if (result['success'] == true) {
    showSuccessSnackbar(successMessage);
  } else {
    showErrorSnackbar(result['error'] ?? 'Something went wrong');
  }
}
```

---

## Key Rules to Remember

1. **Never insert directly** into `adoption_requests` — always use `send_adoption_request` RPC
2. **Cancel deletes the row** — don't look for a `cancelled` status, the row will be gone
3. **Accepting auto-declines others** server-side — no need to handle this in the frontend
4. **Pet status is driven by requests** — `reserved` is set automatically on accept, `available` is restored on reopen
5. **Owner cannot request their own pet** — hide the CTA if `pet.posted_by == currentUser.id`
6. **One active request per user per pet** — the unique index enforces this; the RPC returns a clear error if violated
