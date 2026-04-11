import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import LoginWithGoogleButton from "@/src/features/auth/components/LoginWithGoogle/LoginWithGoogle";
import OrDivider from "@/src/features/auth/components/OrDivider/OrDivider";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "@/src/features/auth/utils/validation";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import CustomTextButton from "@/src/shared/components/ui/TextButton/TextButton";

export default function SignupForm({
  onSignup,
  onGoogleSignup,
  loading,
  onNavigateToLogin,
}) {
  const { t } = useTranslationLoader("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ─── Validation ───────────────────────────────────────────────────────────

  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email, t) }));
  };

  const handlePasswordBlur = () => {
    setErrors((prev) => ({ ...prev, password: validatePassword(password, t) }));
  };

  const handleConfirmPasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, confirmPassword, t),
    }));
  };

  // ─── Submission ───────────────────────────────────────────────────────────

  const handleSignup = async () => {
    const emailErr = validateEmail(email, t);
    const passwordErr = validatePassword(password, t);
    const confirmErr = validateConfirmPassword(password, confirmPassword, t);
    setErrors({
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmErr,
    });
    if (emailErr || passwordErr || confirmErr) return;

    Keyboard.dismiss();
    await onSignup(email, password);
  };

  const handleGoogleSignup = async () => {
    await onGoogleSignup();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.form}>
        <AppInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          onBlur={handleEmailBlur}
          placeholder={t("signup.email.placeholder")}
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <AppInput
          value={password}
          isPassword
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onBlur={handlePasswordBlur}
          placeholder={t("signup.password.placeholder")}
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
          onBlur={handleConfirmPasswordBlur}
          placeholder={t("signup.confirmPassword.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
        />

        <AppButton
          text={t("signup.buttons.default")}
          onPress={handleSignup}
          loading={loading}
        />

        <OrDivider />

        <LoginWithGoogleButton
          title={t("signup.buttons.google")}
          onPress={handleGoogleSignup}
          disabled={loading}
        />

        <CustomTextButton
          label={t("signup.buttons.register.text")}
          buttonText={t("signup.buttons.register.button")}
          onPress={onNavigateToLogin}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  form: {
    flexDirection: "column",
    gap: 10,
  },
});
