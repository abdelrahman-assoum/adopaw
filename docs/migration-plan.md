# Adopaw Migration Plan
**From:** `adopaw-frontend-old` (Socket.IO + Node.js REST backend)
**To:** `adopaw` (Supabase-only — auth, database, realtime, storage)

---

## App Flow
```
Splash (index.jsx)
  └── Language not set → select-language.jsx
  └── Never launched  → (onboarding)/
  └── No session      → (auth)/login
  └── Session valid   → (tabs)/home
```

---

## Stack Comparison

| Concern | Old | New |
|---|---|---|
| Auth | Supabase + Redux session store | Supabase only (AsyncStorage persistence built-in) |
| Real-time | Socket.IO | Supabase Realtime channels |
| Data fetching | REST API (`EXPO_PUBLIC_BACKEND_API_URL`) + React Query | Supabase JS client + React Query |
| State | Redux Toolkit (`authSlice`) + ThemeContext | ThemeContext only (no Redux) |
| Image upload | Supabase Storage via backend | Supabase Storage direct |
| Navigation | Expo Router 5 | Expo Router 6 |

---

## Commit History

### ✅ Commit 1 — Initial Expo Router scaffold
Basic project creation. Expo Router 6, empty route stubs for all screens.

---

### ✅ Commit 2 — Foundation: Supabase + Theme + i18n

**Files:**
- `src/shared/services/supabase/client.js` — AsyncStorage-persisted Supabase client
- `src/shared/services/supabase/auth.js` — signIn/signUp/Google OAuth/OTP/signOut
- `src/shared/services/supabase/upload.js` — image upload with signed URLs
- `src/context/ThemeContext.js` — light/dark/system theme preference
- `src/theme/` — colors, light, dark, fonts, radii, spacing, shadows, typography
- `src/hooks/useAppTheme.ts`
- `src/localization/i18n.js` — i18next init with `resources` from registry, RTL support
- `src/localization/hooks/useTranslationLoader.js`
- `src/localization/utils/loadNamespace.js`
- `src/localization/utils/translationRegistry.js`
- `src/localization/locale/en/` + `ar/` — all 11 JSON namespace files
- `src/fonts/alexandria.js`
- `src/shared/constants/storageKeys.js`
- `src/shared/constants/tables.js`
- `src/shared/utils/errorMapper.js`
- `app/_layout.jsx` — SafeAreaProvider + QueryClientProvider + I18nextProvider + ThemeProvider + PaperProvider

**Key decisions:**
- `resources: translationRegistry` in i18n init → translations available immediately, no backend loader needed
- `ns: Object.keys(translationRegistry.en)` → auto-expands as namespaces are added
- No Redux — Supabase session persists to AsyncStorage automatically
- `signInWithGoogle` uses `expo-auth-session/build/QueryParams` helper to parse hash fragments correctly

---

### ✅ Commit 3 — App Shell: Boot screen + Splash + Language select

**Files:**
- `app/index.jsx` — `SplashScreen.preventAutoHideAsync()` at module level, hide after fonts load, branded logo, boot logic
- `app/select-language.jsx` — language picker using `setLanguage()` from i18n.js
- `assets/images/` — all images copied from old project (logos, flags, animal icons, splash)

**Boot sequence:**
```
fonts loaded → SplashScreen.hideAsync() → check ALREADY_LAUNCHED
  └── false → /(onboarding)
  └── true  → getCurrentSession()
                └── no session → /login
                └── session    → /(tabs)/home
```

**Install:**
```bash
npx expo install expo-localization
```

---

### ✅ Commit 4 — Shared UI Components

**Files created in `src/shared/components/ui/`:**
- `AppButton/AppButton.jsx`
- `AppInput/AppInput.jsx`
- `Heading/Heading.jsx`
- `LoadingModal/LoadingModal.jsx`
- `Snackbar/AppSnackbar.jsx` (or `InfoCard/InfoCard.jsx`)
- `TextButton/TextButton.jsx`
- `ColorSelectOption/`
- `CustomSelect/`
- `CustomTabBar/`
- `LocationPreview/`
- `NavigationButton/`
- `PetsList/`
- `StandardSelect/`
- `AgeSlider/`

**Source:** Copy from `adopaw-frontend-old/src/shared/components/ui/` — no Redux dependency in any of these.

**Install:**
```bash
npx expo install react-native-modal
npx expo install @react-native-community/slider   # for AgeSlider
```

---

### ✅ Commit 5 — Language Select + Onboarding Flow

**Files:**
- `app/(onboarding)/_layout.jsx` — Stack, no header, slide animation
- `app/(onboarding)/index.jsx`
- `app/(onboarding)/get-started.jsx`
- `app/(onboarding)/step1.jsx` → `step4.jsx`
- `src/features/onboarding/components/OnboardingScreen.jsx`
- `src/shared/constants/languages.js`

**Source:** Copy screens from old project. `OnboardingScreen` uses `useTranslationLoader("onboarding")`, themed `ImageBackground`, `Heading`.

**On completion:**
```js
await AsyncStorage.setItem(STORAGE_KEYS.ALREADY_LAUNCHED, "true");
router.replace("/login");
```

**No new packages.**

---

### ✅ Commit 6 — Auth: Login + Signup

**Files:**
- `app/(auth)/_layout.jsx` — Stack, no header
- `app/(auth)/login.jsx`
- `app/(auth)/signup.jsx`
- `src/features/auth/components/LoginForm.jsx`
- `src/features/auth/components/SignupForm.jsx`
- `src/features/auth/components/LoginWithGoogle/LoginWithGoogle.jsx`
- `src/features/auth/components/OrDivider/OrDivider.jsx`
- `src/features/auth/utils/validation.js`
- `src/localization/locale/en/auth.json` + `ar/auth.json` — added Supabase error keys

**Key changes vs old:**
- No `axios` — profile check uses `supabase.from('profiles').select('id').eq('id', userId).single()`
- No Redux `dispatch` — Supabase persists session automatically
- Error display: `mapSupabaseError(msg).replace("auth.", "")` → `t(key)` (i18n snackbar/InfoCard)
- `signInWithGoogle()` handles full OAuth browser flow
- Signup: checks `data.session` — if null, routes to `/otp` (email confirmation); if exists, routes to `/profile-complete`

**No new packages.**

---

### 🔲 Commit 7 — Auth: OTP + Profile Complete + Pet Preferences

**Files:**
- `app/(auth)/otp.jsx` — 6-digit code input, resend with cooldown
- `app/(auth)/profile-complete.jsx` — full name, avatar upload, location
- `app/(auth)/pet-preferences.jsx` — species, gender, size, age, activity selectors
- `src/features/auth/services/profileService.js`
- `src/shared/constants/options.js`, `prefs.js`, `animals.js`
- `src/shared/utils/pickImages.js`

**New Supabase logic:**
```js
// profileService.js
export const createProfile = (userId, data) =>
  supabase.from("profiles").insert({ id: userId, ...data });

export const updatePreferences = (userId, prefs) =>
  supabase.from("profiles").update({ pet_preferences: prefs }).eq("id", userId);
```

**Install:**
```bash
npx expo install expo-image-picker expo-image-manipulator expo-location
```

---

### 🔲 Commit 8 — Supabase Data Services: Profiles + Pets

**Files:**
- `src/features/profile/services/profileService.js`
- `src/features/profile/hooks/useProfile.js`
- `src/features/pets/services/petService.js`
- `src/features/home/hooks/usePets.js`
- `src/features/home/hooks/useFilters.js`

**Replaces all REST API calls with Supabase:**
```js
// usePets.js
export function usePets(filters) {
  return useInfiniteQuery({
    queryKey: ["pets", filters],
    queryFn: ({ pageParam = 0 }) =>
      supabase.from("pets")
        .select("*, profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + 19),
    getNextPageParam: (_, pages) => pages.length * 20,
  });
}
```

**No new packages.**

---

### 🔲 Commit 9 — Home Tab: Pet Discovery + Filters + Pet Detail

**Files:**
- `app/(tabs)/home/_layout.jsx`
- `app/(tabs)/home/index.jsx`
- `app/(tabs)/home/filter.jsx`
- `app/(tabs)/home/[petId].jsx`
- `src/features/home/components/SearchBar.jsx`
- `src/features/home/components/PetsCategories.jsx`
- `src/features/home/components/FilterButton.jsx`
- `src/features/pets/Components/PetCard.jsx`
- `src/features/pets/Components/PetDetails.jsx`
- `src/features/home/utils/timeAgo.js`
- `src/features/home/utils/distance.js`

**Source:** Copy from old, replace API calls with `usePets(filters)` and `useQuery` hooks.

**No new packages.**

---

### 🔲 Commit 10 — AddPet Tab: Create + Edit Pet Form

**Files:**
- `app/(tabs)/addPet/_layout.jsx`
- `app/(tabs)/addPet/index.jsx`
- `app/(tabs)/addPet/[petId].jsx`
- `src/features/addPet/Components/BreedSelect.jsx`
- `src/features/addPet/Components/ColorSelect.jsx`
- `src/features/addPet/Components/MapPicker.jsx`
- `src/features/addPet/Components/PetImagePicker.jsx`
- `src/features/pets/Components/PetForm.jsx`

**New Supabase logic:**
```js
// Create
await supabase.from("pets").insert({
  owner_id: userId,
  images: await uploadImages(uris, "pets", "pet-images"),
  location: { lat, lng },
  ...formData,
});

// Edit
await supabase.from("pets").update(formData).eq("id", petId);
```

**No new packages** (expo-image-picker already installed in Commit 7).

---

### 🔲 Commit 11 — Profile Tab: Settings, My Pets, Preferences

**Files:**
- `app/(tabs)/profile/_layout.jsx`
- `app/(tabs)/profile/index.jsx`
- `app/(tabs)/profile/user-profile.jsx`
- `app/(tabs)/profile/user-pets.jsx`
- `app/(tabs)/profile/user-pet-preferences.jsx`
- `app/(tabs)/profile/user-language.jsx`
- `app/(tabs)/profile/user-theme.jsx`
- `app/(tabs)/profile/appearance.jsx`
- `app/(tabs)/profile/notifications.jsx`
- `app/(tabs)/profile/help.jsx`

**New logic:**
- Profile data: `useProfile(userId)` hook (no Redux selector)
- Logout: `await signOut()` → `AsyncStorage.multiRemove([...])` → `router.replace("/login")`
- Language: `setLanguage("ar")` → triggers `Updates.reloadAsync()` (RTL switch)
- Theme: `updateTheme("dark")` from `useThemeContext()`

**No new packages.**

---

### 🔲 Commit 12 — Navigation Polish: Custom Tab Bar + Auth Guard

**Files:**
- `app/(tabs)/_layout.jsx` — full tab config + `onAuthStateChange` guard
- `src/shared/components/ui/CustomTabBar/CustomTabBar.jsx`

**Auth guard pattern:**
```js
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
    if (!session) router.replace("/login");
  });
  return () => subscription.unsubscribe();
}, []);
```

**Tab config:** `addPet` has `href: null` (hidden from bar), accessible via `router.push("/(tabs)/addPet")` from home screen.

**No new packages.**

---

### 🔲 Commit 13 — Map Tab: Google Maps + Pet Location Pins

**Files:**
- `app/(tabs)/map/_layout.jsx`
- `app/(tabs)/map/index.jsx`
- `src/features/map/components/PetMarker.jsx`
- `src/features/map/hooks/useCurrentLocation.js`

**New Supabase logic:**
```js
const { data: pets } = await supabase
  .from("pets")
  .select("id, name, species, images, location")
  .not("location", "is", null);
// location is stored as JSON { lat, lng }
```

Tap marker → `router.push("/(tabs)/home/" + pet.id)`

**Install:**
```bash
npx expo install react-native-maps
```

Add to `app.config.js`:
```js
android: { config: { googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } } }
```

---

### 🔲 Commit 14 — Chats Tab: Supabase Realtime + Pawlo AI

**Files:**
- `app/(tabs)/chats/_layout.jsx`
- `app/(tabs)/chats/index.jsx`
- `app/(tabs)/chats/[chatId].jsx`
- `app/(tabs)/chats/pawlo.jsx`
- `src/features/chats/services/chatService.js` — **full rewrite** (no Socket.IO)
- `src/features/chats/hooks/useChats.js`
- `src/features/chats/hooks/useMessages.js`
- `src/features/chats/components/ChatList.jsx`
- `src/features/chats/components/MessageBubble.jsx`

**Socket.IO → Supabase Realtime replacement:**
```js
// OLD
socket.on(`message:new:${chatId}`, handler);
socket.emit("chat:join", { chatId });

// NEW
const channel = supabase
  .channel(`messages:${chatId}`)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `chat_id=eq.${chatId}`,
  }, (payload) => onNewMessage(payload.new))
  .subscribe();

// cleanup
return () => supabase.removeChannel(channel);
```

**No new packages** — Supabase Realtime is built into `@supabase/supabase-js`.

---

## Package Install Summary

| Commit | Command |
|---|---|
| 3 | `npx expo install expo-localization` |
| 4 | `npx expo install react-native-modal @react-native-community/slider` |
| 7 | `npx expo install expo-image-picker expo-image-manipulator expo-location` |
| 13 | `npx expo install react-native-maps` |

---

## Copy vs Rewrite Reference

| Item | Action | Note |
|---|---|---|
| `src/theme/` | ✅ Done | Identical |
| `ThemeContext.js` | ✅ Done | Identical |
| `i18n.js` | ✅ Done | Changed: `resources` from registry, fixed `ns: []` |
| Locale JSONs (`en/`, `ar/`) | ✅ Done | Copied + added Supabase error keys |
| Shared UI components | Copy | Strip any Redux imports |
| Onboarding screens | Copy | No changes needed |
| `login.jsx` / `signup.jsx` | Adapt | Remove axios, remove Redux dispatch, add Supabase profile check |
| `auth.js` (supabase) | Adapt | Fixed Google OAuth URL hash parsing |
| `validation.js` | Copy | No changes |
| `OrDivider.jsx` | Copy | Minor import path update |
| `LoginWithGoogle.jsx` | Rewrite | Was broken — now uses `signInWithGoogle()` from auth.js |
| Home screens | Adapt | Replace REST calls with `usePets()` hook |
| PetCard / PetDetails | Copy | No Redux dependency |
| AddPet screens | Adapt | Replace API calls with Supabase insert/update |
| Profile tab screens | Adapt | Replace Redux selector with hook, fix logout |
| Map tab | Adapt | Replace REST call with Supabase query |
| Chat screens (UI) | Copy layout | Strip all socket logic |
| `chatService.js` | **Rewrite** | Full Supabase Realtime replacement |
| Redux store / authSlice | ❌ Delete | Not needed |
| `initSocket` / socket client | ❌ Delete | Replaced by Supabase Realtime |
