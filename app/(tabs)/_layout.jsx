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
        const nestedState = activeRoute?.state;
        const nestedIndex = nestedState?.index ?? 0;
        // Also hide when navigating directly into a non-index screen (stack depth is 1
        // but the single route is not the tab root, e.g. cross-tab push to [chatId])
        const currentScreenName = nestedState?.routes?.[nestedIndex]?.name ?? "index";
        const isDeep =
          nestedIndex > 0 ||
          currentScreenName !== "index" ||
          activeRoute?.name === "addPet";
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
