import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { validateEmail } from "@/src/features/auth/utils/validation";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import AppSnackbar from "@/src/shared/components/ui/Snackbar/AppSnackbar";
import {
  checkEmailExists,
  resetPasswordForEmail,
} from "@/src/shared/services/supabase/auth";
import { mapSupabaseError } from "@/src/shared/utils/errorMapper";

export default function ForgotPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("auth");
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  function showError(supabaseMessage) {
    const key = mapSupabaseError(supabaseMessage).replace("auth.", "");
    setSnackbarMessage(t(key));
    setSnackbarVisible(true);
  }

  const handleSend = async () => {
    const err = validateEmail(email, t);
    setEmailError(err);
    if (err) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      // Check email exists in the database before sending the OTP
      const exists = await checkEmailExists(email.trim());
      if (!exists) {
        setEmailError(t("errors.emailNotFound"));
        return;
      }

      const { error } = await resetPasswordForEmail(email.trim());

      if (error) {
        showError(error.message);
        return;
      }

      router.push({ pathname: "/reset-otp", params: { email: email.trim() } });
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

      <AppSnackbar
        visible={snackbarVisible && !loading}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
        type="error"
      />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
      >
        {/* ── Back button ────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={colors.onSurface ?? colors.text}
          />
        </TouchableOpacity>

        <Heading
          title={t("forgotPassword.title")}
          description={t("forgotPassword.description")}
          align="start"
        />

        <AppInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          onBlur={() => setEmailError(validateEmail(email, t))}
          placeholder={t("forgotPassword.email.placeholder")}
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!emailError}
          errorMessage={emailError}
        />

        <AppButton
          text={t("forgotPassword.buttons.send")}
          onPress={handleSend}
          loading={loading}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    gap: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  sendButton: {
    marginTop: 8,
  },
});
