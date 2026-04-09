import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PetId() {
  const { petId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Add Pet - Pet ID: {petId}</Text>
    </View>
  );
}
