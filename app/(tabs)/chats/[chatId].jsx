import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ChatId() {
  const { chatId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chat ID: {chatId}</Text>
    </View>
  );
}
