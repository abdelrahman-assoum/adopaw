import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

import LoginWithGoogleButton from "@/src/features/auth/components/LoginWithGoogle/LoginWithGoogle";
import OrDivider from "@/src/features/auth/components/OrDivider/OrDivider";
import {
  validateEmail,
  validatePassword,
} from "@/src/features/auth/utils/validation";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import CustomTextButton from "@/src/shared/components/ui/TextButton/TextButton";

export default function LoginForm({
  onLogin,
  onGoogleLogin,
  loading,
  onNavigateToSignup,
  onNavigateToForgotPassword,
}) {
  const { t } = useTranslationLoader("auth");
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  // ─── Validation ───────────────────────────────────────────────────────────

  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email, t) }));
  };

  const handlePasswordBlur = () => {
    setErrors((prev) => ({ ...prev, password: validatePassword(password, t) }));
  };

  // ─── Submission ───────────────────────────────────────────────────────────

  const handleLogin = async () => {
    const emailErr = validateEmail(email, t);
    const passwordErr = validatePassword(password, t);
    setErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    Keyboard.dismiss();
    await onLogin(email, password);
  };

  const handleGoogleLogin = async () => {
    await onGoogleLogin();
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
          placeholder={t("login.email.placeholder")}
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
          placeholder={t("login.password.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <TouchableOpacity
          onPress={onNavigateToForgotPassword}
          style={styles.forgotPassword}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            {t("login.forgotPassword")}
          </Text>
        </TouchableOpacity>

        <AppButton
          text={t("login.buttons.default")}
          onPress={handleLogin}
          loading={loading}
        />

        <OrDivider />

        <LoginWithGoogleButton
          title={t("login.buttons.google")}
          onPress={handleGoogleLogin}
          disabled={loading}
        />

        <CustomTextButton
          label={t("login.buttons.register.text")}
          buttonText={t("login.buttons.register.button")}
          onPress={onNavigateToSignup}
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
