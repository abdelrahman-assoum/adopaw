import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import AppSnackbar from "@/src/shared/components/ui/Snackbar/AppSnackbar";
import {
  resendOtp,
  verifyOtp,
} from "@/src/shared/services/supabase/auth";
import { supabase } from "@/src/shared/services/supabase/client";
import { mapSupabaseError } from "@/src/shared/utils/errorMapper";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function Otp() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const { t } = useTranslationLoader("auth");

  const { email } = useLocalSearchParams();

  // ─── OTP cells ────────────────────────────────────────────────────────────
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ─── Resend cooldown ──────────────────────────────────────────────────────
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const cooldownRef = useRef(null);

  useEffect(() => {
    startCooldown();
    return () => clearInterval(cooldownRef.current);
  }, []);

  // ─── Auto-submit when all cells are filled ────────────────────────────────
  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      handleVerify();
    }
  }, [digits]);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ─── Snackbar helper ──────────────────────────────────────────────────────
  function showError(supabaseMessage) {
    const key = mapSupabaseError(supabaseMessage).replace("auth.", "");
    setSnackbarMessage(t(key));
    setSnackbarVisible(true);
  }

  // ─── Profile check ────────────────────────────────────────────────────────
  async function checkProfileAndRoute(userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    router.replace(profile ? "/(tabs)/home" : "/profile-complete");
  }

  // ─── Input handlers ───────────────────────────────────────────────────────

  function handleChangeText(text, index) {
    const cleaned = text.replace(/\D/g, "");

    // Paste: full code pasted into any cell
    if (cleaned.length === OTP_LENGTH) {
      setDigits(cleaned.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  // ─── Verify ───────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (loading) return;
    const token = digits.join("");
    if (token.length < OTP_LENGTH) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const { data, error } = await verifyOtp(email, token);

      if (error) {
        showError(error.message);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      await checkProfileAndRoute(data.user.id);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await resendOtp(email);
      if (error) {
        showError(error.message);
      } else {
        startCooldown();
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isFilled = digits.every((d) => d !== "");

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <LoadingModal loading={loading} />

        <AppSnackbar
          visible={snackbarVisible && !loading}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          type="error"
        />

        {/* ── Back button ──────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={colors.onSurface ?? colors.text}
          />
        </TouchableOpacity>

        <Heading
          title={t("otp.title")}
          description={t("otp.description")}
          align="start"
        />

        {/* ── OTP cells ────────────────────────────────────────────────────── */}
        <View style={styles.cellsRow}>
          {digits.map((digit, index) => {
            const isFocused = focusedIndex === index;
            return (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.cell,
                  {
                    borderColor: isFocused
                      ? colors.primary
                      : colors.palette?.neutral?.[300] ?? "#d1d5db",
                    backgroundColor: isFocused
                      ? colors.primaryContainer ?? colors.primary + "18"
                      : colors.surface,
                    color: colors.onSurface ?? colors.text,
                    fontFamily: fonts.headlineMedium?.fontFamily,
                    fontSize: 22,
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textAlign="center"
                selectTextOnFocus
                caretHidden
              />
            );
          })}
        </View>

        {/* ── Resend ───────────────────────────────────────────────────────── */}
        <View style={styles.resendRow}>
          <Text
            style={[
              styles.resendPrompt,
              { color: colors.palette?.neutral?.[500] ?? "#6b7280" },
            ]}
          >
            {t("otp.resend.prompt")}
          </Text>

          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0}>
            <Text
              style={[
                styles.resendButton,
                {
                  color:
                    cooldown > 0
                      ? colors.primary
                      : colors.palette?.coral?.[500] ?? colors.primary,
                  opacity: cooldown > 0 ? 0.7 : 1,
                },
              ]}
            >
              {cooldown > 0
                ? t("otp.resend.buttonCooldown", { seconds: cooldown })
                : t("otp.resend.buttonActive")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Verify button ────────────────────────────────────────────────── */}
        <AppButton
          text={t("otp.verify")}
          onPress={handleVerify}
          loading={loading}
          disabled={!isFilled}
          style={styles.verifyButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  cellsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: "center",
  },
  resendRow: {
    alignItems: "center",
    gap: 4,
    marginBottom: 32,
  },
  resendPrompt: {
    fontSize: 13,
  },
  resendButton: {
    fontSize: 13,
    fontWeight: "600",
  },
  verifyButton: {
    marginTop: "auto",
  },
});
