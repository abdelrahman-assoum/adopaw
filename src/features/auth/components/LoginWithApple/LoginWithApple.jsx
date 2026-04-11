import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginWithAppleButton({ style }) {
  return (
    <TouchableOpacity style={[styles.button, style]}>
      <Ionicons name="logo-apple" size={20} color="#000" />
      <Text style={styles.text}>Login with Apple</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  text: {
    color: "#000",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
});
