import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function HomePetId() {
  const { petId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home - Pet ID: {petId}</Text>
    </View>
  );
}
