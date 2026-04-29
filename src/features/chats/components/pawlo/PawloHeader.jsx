import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function PawloHeader({ avatar, title, description }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Image source={avatar} style={styles.avatar} resizeMode="contain" />
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.palette.neutral[500] }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 24,
  },
  avatar: {
    width: 260,
    height: 260,
  },
  title: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 20,
    marginTop: 12,
    textAlign: "center",
  },
  description: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 8,
  },
});
