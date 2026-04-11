const SUPABASE_ERROR_MAP = {
  "Invalid login credentials": "auth.errors.invalidCredentials",
  "Email not confirmed": "auth.errors.emailNotConfirmed",
  "User already registered": "auth.errors.userAlreadyExists",
  "Password should be at least 6": "auth.errors.passwordTooShort",
  "Unable to validate email address": "auth.errors.invalidEmail",
  "Email rate limit exceeded": "auth.errors.rateLimitExceeded",
  "Token has expired": "auth.errors.otpExpired",
  "Otp has expired": "auth.errors.otpExpired",
  "Invalid OTP": "auth.errors.otpInvalid",
  "invalid otp": "auth.errors.otpInvalid",
  "Token not found": "auth.errors.otpInvalid",
};

export function mapSupabaseError(message = "") {
  for (const [key, i18nKey] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message.includes(key)) return i18nKey;
  }
  return "auth.errors.unknown";
}
