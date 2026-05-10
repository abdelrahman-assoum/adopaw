import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const GUARD_KEY = "pawlo_guard_v1";
const MAX_WARNINGS = 3;
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function usePawloGuard() {
  const [warningCount, setWarningCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef(null);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(GUARD_KEY).then((raw) => {
      if (!raw) return;
      try {
        const state = JSON.parse(raw);
        setWarningCount(state.warningCount ?? 0);
        setCooldownUntil(state.cooldownUntil ?? null);
      } catch {
        // corrupted storage — ignore
      }
    });
  }, []);

  // Tick every second while in cooldown so countdown updates
  useEffect(() => {
    if (!cooldownUntil) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldownUntil]);

  const isBlocked = cooldownUntil != null && now < cooldownUntil;

  // Auto-clear expired cooldown
  useEffect(() => {
    if (cooldownUntil != null && now >= cooldownUntil) {
      const next = { warningCount: 0, cooldownUntil: null };
      setCooldownUntil(null);
      setWarningCount(0);
      AsyncStorage.setItem(GUARD_KEY, JSON.stringify(next));
    }
  }, [now, cooldownUntil]);

  const timeRemaining = isBlocked ? formatRemaining(cooldownUntil - now) : null;

  // Returns true if this warning triggered a cooldown
  const recordOffTopic = useCallback(async () => {
    const next = warningCount + 1;
    if (next >= MAX_WARNINGS) {
      const until = Date.now() + COOLDOWN_MS;
      setCooldownUntil(until);
      setWarningCount(0);
      await AsyncStorage.setItem(
        GUARD_KEY,
        JSON.stringify({ warningCount: 0, cooldownUntil: until })
      );
      return true;
    }
    setWarningCount(next);
    await AsyncStorage.setItem(
      GUARD_KEY,
      JSON.stringify({ warningCount: next, cooldownUntil: null })
    );
    return false;
  }, [warningCount]);

  return { warningCount, isBlocked, timeRemaining, recordOffTopic };
}
