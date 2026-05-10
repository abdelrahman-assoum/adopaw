import { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

// Matches Arabic, Arabic Extended, Hebrew, Syriac, and Arabic Presentation Forms
const RTL_RE = /[֐-׿؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const isRTL = (text) => RTL_RE.test(text);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.72;

export default function MessageBubble({ item, currentUserId }) {
  const theme = useTheme();
  const isMine = item?.senderId === currentUserId;

  const { palette } = theme.colors;
  const bgMine = palette?.blue?.[400] ?? theme.colors.primary;
  const bgOther = theme.colors.surface;
  const fgMine = theme.colors.onPrimary;
  const fgOther = theme.colors.onSurface;

  const timeLabel = useMemo(() => {
    const ts = item?.createdAt;
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [item?.createdAt]);

  const isPending = !!item?.pending;
  const text = item?.content?.text ?? "";
  const textIsRTL = text ? isRTL(text) : false;

  return (
    <View style={[styles.row, { justifyContent: isMine ? "flex-end" : "flex-start" }]}>
      <Surface
        elevation={0}
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          { backgroundColor: isMine ? bgMine : bgOther, opacity: isPending ? 0.65 : 1 },
        ]}
      >
        {!!text && (
          <Text
            style={[
              styles.text,
              { color: isMine ? fgMine : fgOther },
              textIsRTL
                ? { textAlign: "right", writingDirection: "rtl" }
                : { textAlign: "left", writingDirection: "ltr" },
            ]}
            variant="bodyMedium"
          >
            {text}
          </Text>
        )}
        <View style={styles.footer}>
          {isPending && (
            <Text style={[styles.time, { color: isMine ? fgMine : palette?.neutral?.[500] }]}>
              sending…
            </Text>
          )}
          {!!timeLabel && !isPending && (
            <Text style={[styles.time, { color: isMine ? fgMine : palette?.neutral?.[500] }]}>
              {timeLabel}
            </Text>
          )}
        </View>
      </Surface>
    </View>
  );
}

const R = 16;
const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    flexDirection: "row",
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    maxWidth: BUBBLE_MAX_WIDTH,
  },
  bubbleMine: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: R,
  },
  text: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignSelf: "flex-end",
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
});
