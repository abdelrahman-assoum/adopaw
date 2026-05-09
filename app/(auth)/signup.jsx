import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SignupForm from "@/src/features/auth/components/SignupForm";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import InfoCard from "@/src/shared/components/ui/InfoCard/InfoCard";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import {
  signInWithGoogle,
  signUpWithEmail,
} from "@/src/shared/services/supabase/auth";
import { supabase } from "@/src/shared/services/supabase/client";
import { mapSupabaseError } from "@/src/shared/utils/errorMapper";

export default function Signup() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("auth");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoType, setInfoType] = useState("error");

  // ─── Info helper ──────────────────────────────────────────────────────────

  function showError(supabaseMessage) {
    // mapSupabaseError returns "auth.errors.xxx" — strip namespace prefix
    // since t() already works within the "auth" namespace
    const key = mapSupabaseError(supabaseMessage).replace("auth.", "");
    setInfoMessage(t(key));
    setInfoType("error");
    setInfoVisible(true);
    // Auto-hide after 4 seconds
    setTimeout(() => setInfoVisible(false), 4000);
  }

  // ─── Profile check (shared by email + Google signup) ─────────────────────

  async function checkProfileAndRoute(userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    router.replace(profile ? "/(tabs)/home" : "/profile-complete");
  }

  // ─── Email / Password signup ──────────────────────────────────────────────

  const handleSignup = async (email, password) => {
    setLoading(true);

    try {
      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        showError(error.message);
        return;
      }

      // Supabase returns an empty identities array when the email is already
      // registered — it doesn't return an error to prevent enumeration.
      if (data.user?.identities?.length === 0) {
        showError("User already registered");
        return;
      }

      if (data.session) {
        // Email auto-confirm is ON → session exists immediately
        await checkProfileAndRoute(data.user.id);
      } else {
        // Email confirmation required → push so back arrow returns here
        router.push({ pathname: "/otp", params: { email } });
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google signup ────────────────────────────────────────────────────────

  const handleSignupWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        showError(error.message);
        return;
      }

      if (!data?.user) return; // user cancelled the browser

      await checkProfileAndRoute(data.user.id);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LoadingModal loading={loading} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Heading
          title={t("signup.title")}
          description={t("signup.description")}
          align="start"
        />

        <InfoCard
          visible={infoVisible}
          message={infoMessage}
          type={infoType}
          onDismiss={() => setInfoVisible(false)}
        />

        <SignupForm
          onSignup={handleSignup}
          onGoogleSignup={handleSignupWithGoogle}
          loading={loading}
          onNavigateToLogin={() => router.back()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
});
