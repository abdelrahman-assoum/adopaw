import { StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
export default function InputLabel({ text }) {
  const { colors } = useTheme();

  return <Text style={[styles.label]}>{text}</Text>;
}

const styles = StyleSheet.create({
  label: {
    marginVertical: 8,
  },
});
