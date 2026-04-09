import React from "react";
import { Stack } from "expo-router";

export default function OnboardingStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
        
      }}
    />
  );
}
