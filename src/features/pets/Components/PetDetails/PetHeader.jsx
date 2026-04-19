import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function PetHeader({ name, colors = [], adopted, children }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineLarge" style={styles.name}>
          {name}
        </Text>
        <View style={styles.colorRow}>
          {colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorCircle, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
      {children && <View style={{ marginTop: 4 }}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { flexShrink: 1 },
  colorRow: { flexDirection: "row", gap: 6 },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
