import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_WARNINGS    = 3;
const COOLDOWN_MS     = 10 * 60 * 1000;         // 10 min cooldown when limit hit
const WARNING_RESET_MS = 24 * 60 * 60 * 1000;   // accumulated warnings expire after 24 h

const guardKey = (userId) => `pawlo_guard_v2_${userId}`;

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function usePawloGuard(userId) {
  const [warningCount, setWarningCount]     = useState(0);
  const [cooldownUntil, setCooldownUntil]   = useState(null);
  const [firstWarningAt, setFirstWarningAt] = useState(null);
  const [now, setNow]                       = useState(Date.now());
  const timerRef = useRef(null);

  // Load per-user state; reset whenever the active account changes
  useEffect(() => {
    setWarningCount(0);
    setCooldownUntil(null);
    setFirstWarningAt(null);

    if (!userId) return;

    AsyncStorage.getItem(guardKey(userId)).then((raw) => {
      if (!raw) return;
      try {
        const state = JSON.parse(raw);

        // Reset accumulated warnings that are older than WARNING_RESET_MS
        const warningsExpired =
          state.firstWarningAt != null &&
          Date.now() - state.firstWarningAt >= WARNING_RESET_MS;

        if (warningsExpired && state.cooldownUntil == null) {
          const clean = { warningCount: 0, cooldownUntil: null, firstWarningAt: null };
          AsyncStorage.setItem(guardKey(userId), JSON.stringify(clean));
          return;
        }

        setWarningCount(state.warningCount ?? 0);
        setCooldownUntil(state.cooldownUntil ?? null);
        setFirstWarningAt(state.firstWarningAt ?? null);
      } catch {
        // corrupted — ignore
      }
    });
  }, [userId]);

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
    if (!userId || cooldownUntil == null || now < cooldownUntil) return;
    const next = { warningCount: 0, cooldownUntil: null, firstWarningAt: null };
    setCooldownUntil(null);
    setWarningCount(0);
    setFirstWarningAt(null);
    AsyncStorage.setItem(guardKey(userId), JSON.stringify(next));
  }, [now, cooldownUntil, userId]);

  const timeRemaining = isBlocked ? formatRemaining(cooldownUntil - now) : null;

  const recordOffTopic = useCallback(async () => {
    if (!userId) return false;

    const next = warningCount + 1;
    // Stamp the time of the very first warning in this cycle
    const stamp = firstWarningAt ?? Date.now();

    if (next >= MAX_WARNINGS) {
      const until = Date.now() + COOLDOWN_MS;
      setCooldownUntil(until);
      setWarningCount(0);
      setFirstWarningAt(null);
      await AsyncStorage.setItem(
        guardKey(userId),
        JSON.stringify({ warningCount: 0, cooldownUntil: until, firstWarningAt: null })
      );
      return true;
    }

    setWarningCount(next);
    setFirstWarningAt(stamp);
    await AsyncStorage.setItem(
      guardKey(userId),
      JSON.stringify({ warningCount: next, cooldownUntil: null, firstWarningAt: stamp })
    );
    return false;
  }, [warningCount, firstWarningAt, userId]);

  return { warningCount, isBlocked, timeRemaining, recordOffTopic };
}
