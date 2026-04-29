import { useEffect, useState } from "react";
import { supabase } from "@/src/shared/services/supabase/client";

export function useCurrentUser() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUserId(session?.user?.id ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  return userId;
}
