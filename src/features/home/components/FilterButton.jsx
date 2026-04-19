import { MaterialCommunityIcons as MDI } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function FilterButton({ style, activeCount = 0, currentParams = {} }) {
  const theme = useTheme();
  const router = useRouter();

  const blue = theme.colors.palette.blue;
  const neutral = theme.colors.palette.neutral;
  const radius = theme.custom?.radii?.xl ?? 20;
  const isActive = activeCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: "/(tabs)/home/filter", params: currentParams })}
      style={[
        styles.button,
        {
          backgroundColor: isActive ? blue[100] : "#FFFFFF",
          borderColor: isActive ? blue[500] : neutral[300],
          borderRadius: radius,
        },
        style,
      ]}
      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
    >
      <MDI name="filter-variant" size={22} color={blue[500]} />
      {isActive && (
        <View style={[styles.badge, { backgroundColor: blue[500] }]}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", lineHeight: 12 },
});
