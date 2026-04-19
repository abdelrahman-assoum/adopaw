# Session Log — Adopaw Migration
**Date:** 2026-04-19 / 2026-04-20
**Topic:** Migrating `adopaw-frontend-old` (Socket.IO + REST) → `adopaw` (Supabase-only)

---

## 1. Initial Brief

**User:** Check `adopaw-frontend-old/` and `adopaw/`. I am migrating the old project (Socket.IO + Node.js backend) to full Supabase integration. The new project is `adopaw/`. I want to divide work into commits following the app flow: splash → language select → onboarding → auth → tabs. I did an initial commit. Now I need to verify the "Supabase + theme + i18n" commit, and want a plan for the next 12 commits.

**Summary of both projects found:**

Old project:
- Expo Router 5, React Native 0.79.5, Expo 53
- Redux Toolkit for auth session (`authSlice`)
- Socket.IO for real-time chat (`chatService.js`)
- REST backend (`EXPO_PUBLIC_BACKEND_API_URL`) for pets, profiles, chat
- Supabase for auth only
- 40+ screens, 16 shared UI components
- i18n with 11 namespaces (en + ar), RTL support
- Custom theme (light/dark, Paper-based)

New project:
- Expo Router 6, React Native 0.81.5, Expo 54
- No Redux, no Socket.IO
- Supabase for everything (auth, database, storage, realtime)
- Supabase client, auth service, upload service already set up
- Theme + i18n infrastructure copied
- All screen files exist as stubs
- Locale JSON files missing, `_layout.jsx` empty, `translationRegistry.js` empty

---

## 2. Commit 2 Verification (Supabase + Theme + i18n)

**Issues found:**

1. **`src/localization/locale/` was empty** — `translationRegistry.js` had `{ en: {}, ar: {} }` with no JSON files registered. Fix: copy all 11 locale JSON files from old project, register them in `translationRegistry.js`.

2. **`app/_layout.jsx` was completely empty** — needed `SafeAreaProvider`, `QueryClientProvider`, `I18nextProvider`, `ThemeProvider`, `PaperProvider`. Redux and `initSocket` removed.

3. **`app/index.jsx` routing to `/login`** — confirmed correct. In Expo Router, `(auth)` is a transparent group so `/login` correctly resolves to `app/(auth)/login.jsx`.

**`_layout.jsx` pattern (no Redux, no Socket.IO):**
```jsx
export default function RootLayout() {
  useEffect(() => { initializeLanguageAndRTL(); }, []);
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const { resolvedTheme } = useThemeContext();
  const theme = resolvedTheme === "dark" ? CustomDarkTheme : CustomLightTheme;
  return <PaperProvider theme={theme}><Slot /></PaperProvider>;
}
```

---

## 3. Commit 3 — `app/index.jsx` (Boot Screen)

**User:** For day 1 give me the code for `index.jsx`.

**Key decisions:**
- `SplashScreen.preventAutoHideAsync()` at module level (before component) keeps native splash visible while fonts load
- `SplashScreen.hideAsync()` called immediately after fonts loaded — branded `View` with app logo replaces native splash, then boot logic runs
- Theme-aware background (`resolvedTheme` → correct `colors.background`)
- `expo-image` `<Image>` instead of RN `<Image>` for better asset caching
- `didRun` ref prevents double-execution in React Strict Mode

```jsx
SplashScreen.preventAutoHideAsync(); // module level

export default function BootScreen() {
  const fontsLoaded = useLoadFonts();
  const didRun = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || didRun.current) return;
    didRun.current = true;
    SplashScreen.hideAsync();
    boot();
  }, [fontsLoaded]);

  async function boot() {
    const launched = await AsyncStorage.getItem(STORAGE_KEYS.ALREADY_LAUNCHED);
    if (!launched) { router.replace("/(onboarding)"); return; }
    const session = await getCurrentSession();
    if (!session?.access_token) { router.replace("/login"); return; }
    router.replace("/(tabs)/home");
  }
  // renders branded logo View with theme-aware background
}
```

**User adjustment:** Hardcoded `const launched = false` to test onboarding. Logo path changed to `../src/assets/images/logo-tp.png`.

---

## 4. Localization Bug Fix

**User:** Onboarding is working but showing `step1.title` instead of translated text.

**Root cause — two bugs working together:**

**Bug 1: `ns: []` in `i18n.init()`**
When i18next initializes with an empty namespace list and `useTranslation(["onboarding"])` requests a namespace not in that list, i18next enters a perpetual "loading" state (no backend to fetch from). `t()` returns raw keys while "waiting."

**Bug 2: `hasLoadedNamespace` / `loadNamespaces` in `loadNamespace.js`**
After `addResourceBundle()` succeeds, `hasLoadedNamespace` still returns `false` (that flag is set only by a backend plugin, which doesn't exist). So `loadNamespaces` was called every render — a no-op that interfered.

**Fix — `i18n.js`:**
```js
import translationRegistry from "./utils/translationRegistry";

const namespaces = Object.keys(translationRegistry.en);

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  resources: translationRegistry,  // ← all translations available immediately
  ns: namespaces,                  // ← auto-populated from registry
  defaultNS: namespaces[0] ?? "common",
  interpolation: { escapeValue: false },
});
```

**Fix — `loadNamespace.js`:**
- Made synchronous (no async/await needed)
- Removed `hasLoadedNamespace` / `loadNamespaces` block
- Kept `addResourceBundle` for any namespace added dynamically after init

**Fix — `useTranslationLoader.js`:**
- Removed `ready` state (resources are pre-loaded, `t()` works on first render)
- Removed `Promise.all` async chain

**Adding namespaces going forward:** Just add to `translationRegistry.js` — `i18n.js` picks up new keys automatically via `Object.keys(translationRegistry.en)`.

---

## 5. Commit 6 — Login + Signup Screens

**User:** For day 4 write the code for `login.jsx` and `signup.jsx` (as is the old but with modifications).

### Files produced

**`src/features/auth/utils/validation.js`** — direct copy from old project.

**`src/features/auth/components/OrDivider/OrDivider.jsx`** — copy, updated import path to `@/src/localization/i18n`.

**`src/features/auth/components/LoginWithGoogle/LoginWithGoogle.jsx`** — rewritten. Old was broken (used `AuthRequest` incorrectly). New is a pure presentational button; all OAuth logic lives in the screen.

**`src/shared/services/supabase/auth.js`** — fixed `signInWithGoogle`:
- Old (broken): `url.searchParams.get("access_token")` — reads query params
- New (correct): `expo-auth-session/build/QueryParams` helper which handles URL hash fragments properly
- Also added `verifyOtp()` and `resendOtp()` functions

**`src/localization/locale/en/auth.json` + `ar/auth.json`** — added Supabase error keys under `errors`:
`invalidCredentials`, `emailNotConfirmed`, `userAlreadyExists`, `passwordTooShort`, `rateLimitExceeded`, `sessionExpired`, `otpExpired`, `otpInvalid`, `unknown`

**`app/(auth)/login.jsx`** — key changes from old:

| Old | New |
|---|---|
| `axios.get('/profile/:id')` | `supabase.from("profiles").select("id").eq("id", userId).single()` |
| `dispatch(setSession(...))` | Removed — session auto-persisted by Supabase |
| `Alert.prompt` for Google | Full `signInWithGoogle()` flow |
| Manual error string split | `mapSupabaseError(msg).replace("auth.", "")` → `t(key)` |
| `router.replace("/home")` | `router.replace("/(tabs)/home")` |

**User refactored** to extract form into `LoginForm` component, replaced `AppSnackbar` with `InfoCard`.

**`app/(auth)/signup.jsx`** — key changes from old:

| Old | New |
|---|---|
| No `LoadingModal` | Added `<LoadingModal loading={loading} />` |
| `Alert.alert` for errors | `InfoCard` with i18n message, auto-hide after 4s |
| Always routes to `/profile-complete` | Smart: `data.session` exists → profile-complete; no session → `/otp` |
| Inline validation | Uses `validation.js` functions |
| `Alert.prompt` for Google | Full `signInWithGoogle()` flow |

**User refactored** to extract form into `SignupForm` component, passes `email` as param when routing to `/otp`:
```js
router.replace({ pathname: "/otp", params: { email } });
```

### Error mapping pattern

`mapSupabaseError(error.message)` returns `"auth.errors.xxx"`.
Since `useTranslationLoader("auth")` gives a `t()` scoped to `auth` namespace:
```js
const key = mapSupabaseError(error.message).replace("auth.", ""); // "errors.xxx"
setInfoMessage(t(key)); // looks up auth.errors.xxx
```

---

## Key Architecture Decisions

| Decision | Rationale |
|---|---|
| No Redux | Supabase `auth.persistSession: true` + AsyncStorage means session state is always derivable from `supabase.auth.getSession()`. No need for a Redux store. |
| `resources` in i18n init | JSON files are Metro-bundled at build time anyway (all `require()` calls in registry). Lazy loading offers no bundle size benefit. Pre-loading eliminates the `ns: []` async loading bug. |
| `checkProfileAndRoute` helper in auth screens | Both email login and Google login need to check if a profile row exists after auth succeeds. Shared function avoids duplication. |
| `data.session` check in signup | Supabase can be configured with auto-confirm ON or OFF. Checking `data.session` makes the app work correctly in both modes without hardcoding. |
| `SplashScreen.preventAutoHideAsync()` at module level | Must run before React's first render. Module-level execution in Expo Router ensures this. |
| `LoginWithGoogle` as pure UI component | Auth logic (signInWithGoogle, profile check, routing) belongs to the screen, not the button. Makes the button reusable and testable. |
| Supabase Realtime for chat (Commit 14) | Direct replacement for Socket.IO events. `postgres_changes` listener on `messages` table replaces `message:new:{chatId}` socket event. Cleanup via `supabase.removeChannel()` replaces socket disconnect. |
