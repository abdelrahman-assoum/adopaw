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

import {
  validateConfirmPassword,
  validatePassword,
} from "@/src/features/auth/utils/validation";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import AppSnackbar from "@/src/shared/components/ui/Snackbar/AppSnackbar";
import { updateUserPassword } from "@/src/shared/services/supabase/auth";
import { mapSupabaseError } from "@/src/shared/utils/errorMapper";

export default function NewPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("auth");
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");

  function showError(supabaseMessage) {
    const key = mapSupabaseError(supabaseMessage).replace("auth.", "");
    setSnackbarMessage(t(key));
    setSnackbarType("error");
    setSnackbarVisible(true);
  }

  const handleUpdate = async () => {
    const passwordErr = validatePassword(password, t);
    const confirmErr = validateConfirmPassword(password, confirmPassword, t);
    setErrors({ password: passwordErr, confirmPassword: confirmErr });
    if (passwordErr || confirmErr) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const { error } = await updateUserPassword(password);

      if (error) {
        showError(error.message);
        return;
      }

      setSnackbarMessage(t("newPassword.success"));
      setSnackbarType("success");
      setSnackbarVisible(true);
      setTimeout(() => router.replace("/login"), 1500);
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
        type={snackbarType}
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
          title={t("newPassword.title")}
          description={t("newPassword.description")}
          align="start"
        />

        <AppInput
          value={password}
          isPassword
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onBlur={() =>
            setErrors((prev) => ({
              ...prev,
              password: validatePassword(password, t),
            }))
          }
          placeholder={t("newPassword.password.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <AppInput
          value={confirmPassword}
          isPassword
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          onBlur={() =>
            setErrors((prev) => ({
              ...prev,
              confirmPassword: validateConfirmPassword(
                password,
                confirmPassword,
                t
              ),
            }))
          }
          placeholder={t("newPassword.confirmPassword.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
        />

        <AppButton
          text={t("newPassword.buttons.update")}
          onPress={handleUpdate}
          loading={loading}
          style={styles.updateButton}
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
  updateButton: {
    marginTop: "auto",
  },
});
