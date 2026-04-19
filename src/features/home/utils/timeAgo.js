export function formatTimeAgo(dateInput, t) {
  const now = Date.now();
  const created = new Date(dateInput).getTime();
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 5) return t("justNow");
  if (diffInSeconds < 60) return t("secondsAgo", { count: diffInSeconds });

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return t("minutesAgo", { count: diffInMinutes });

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return t("hoursAgo", { count: diffInHours });

  const diffInDays = Math.floor(diffInHours / 24);
  return t("daysAgo", { count: diffInDays });
}
