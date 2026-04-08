import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ChatId() {
  const { chatId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat ID: {chatId}</Text>
    </View>
  );
}