import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function HomeLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="filter" />
      <Stack.Screen name="[petId]" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
