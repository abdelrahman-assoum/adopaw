import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PetId() {
  const { petId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Add Pet - Pet ID: {petId}</Text>
    </View>
  );
}