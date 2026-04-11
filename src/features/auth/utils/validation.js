export const validateEmail = (email, t) => {
  if (!email) return t("errors.required");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return t("errors.invalidEmail");
  return "";
};

export const validatePassword = (password, t) => {
  if (!password) return t("errors.required");
  if (password.length < 6) return t("errors.weakPassword");
  return "";
};

export const validateConfirmPassword = (password, confirmPassword, t) => {
  if (!confirmPassword) return t("errors.required");
  if (password !== confirmPassword) return t("errors.passwordMismatch");
  return "";
};
