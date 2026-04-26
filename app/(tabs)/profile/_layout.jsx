import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user-profile" />
      <Stack.Screen name="user-pets" />
      <Stack.Screen name="user-pet-preferences" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="user-theme" />
      <Stack.Screen name="user-language" />
      <Stack.Screen name="help" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="[petId]" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
