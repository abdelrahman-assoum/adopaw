import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./client";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });
  
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
  
  if (result.type !== "success") {
    // Return early if the user cancelled or dismissed the browser
    return { data: null, error: null };
  }

  // Parse the URL params using expo-auth-session QueryParams helper
  // This cleanly handles URL decoding and extracting both hash fragments and query params in React Native
  const { params, errorCode } = QueryParams.getQueryParams(result.url);

  if (errorCode) {
    return { data: null, error: new Error(errorCode) };
  }

  const { access_token, refresh_token } = params;

  if (access_token) {
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (sessionError) return { data: null, error: sessionError };
    return { data: sessionData, error: null };
  }

  return { data: null, error: new Error("OAuth did not return a token") };
}

export async function verifyOtp(email, token) {
  return supabase.auth.verifyOtp({ email, token, type: "email" });
}

export async function resendOtp(email) {
  return supabase.auth.resend({ type: "signup", email });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
