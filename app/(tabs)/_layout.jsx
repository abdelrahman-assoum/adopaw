import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

import { supabase } from "@/src/shared/services/supabase/client";
import CustomTabBar from "@/src/shared/components/ui/CustomTabBar";

export default function TabsLayout() {
  const router = useRouter();

  // Auth guard — redirect to login if session is revoked while inside tabs
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index];
        const nestedIndex = activeRoute?.state?.index ?? 0;
        const isDeep = nestedIndex > 0 || activeRoute?.name === "addPet";
        return isDeep ? null : <CustomTabBar {...props} />;
      }}
    >
      <Tabs.Screen name="home"    options={{ title: "Home" }} />
      <Tabs.Screen name="map"     options={{ title: "Map" }} />
      <Tabs.Screen name="chats"   options={{ title: "Chats" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="addPet"  options={{ href: null }} />
    </Tabs>
  );
}
