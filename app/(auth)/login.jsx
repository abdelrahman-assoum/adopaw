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

import LoginForm from "@/src/features/auth/components/LoginForm";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import InfoCard from "@/src/shared/components/ui/InfoCard/InfoCard";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import {
  signInWithEmail,
  signInWithGoogle,
} from "@/src/shared/services/supabase/auth";
import { supabase } from "@/src/shared/services/supabase/client";
import { mapSupabaseError } from "@/src/shared/utils/errorMapper";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("auth");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoType, setInfoType] = useState("error");

  // ─── Profile check (replaces old axios call to backend) ───────────────────

  async function checkProfileAndRoute(userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    router.replace(profile ? "/(tabs)/home" : "/profile-complete");
  }

  // ─── Info helper ──────────────────────────────────────────────────────────

  function showError(supabaseMessage) {
    // mapSupabaseError returns "auth.errors.xxx" — strip the namespace prefix
    // since t() already works within the "auth" namespace
    const key = mapSupabaseError(supabaseMessage).replace("auth.", "");
    setInfoMessage(t(key));
    setInfoType("error");
    setInfoVisible(true);
    // Auto-hide after 4 seconds
    setTimeout(() => setInfoVisible(false), 4000);
  }

  // ─── Email / Password login ───────────────────────────────────────────────

  const handleLogin = async (email, password) => {
    setLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        showError(error.message);
        return;
      }

      await checkProfileAndRoute(data.user.id);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google login ─────────────────────────────────────────────────────────

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        showError(error.message);
        return;
      }

      // User cancelled the browser — do nothing
      if (!data?.user) return;

      await checkProfileAndRoute(data.user.id);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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
          title={t("login.title")}
          description={t("login.description")}
          align="start"
        />

        <InfoCard
          visible={infoVisible}
          message={infoMessage}
          type={infoType}
          onDismiss={() => setInfoVisible(false)}
        />

        <LoginForm
          onLogin={handleLogin}
          onGoogleLogin={handleLoginWithGoogle}
          loading={loading}
          onNavigateToSignup={() => router.push("/signup")}
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
