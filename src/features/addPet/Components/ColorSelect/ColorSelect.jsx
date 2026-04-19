import { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { animalsColors } from "@/src/shared/constants/prefs";

export default function ColorSelect({ value = [], onChange }) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["common", "addPet"]);
  const [selectedColors, setSelectedColors] = useState(value);
  const [modalVisible, setModalVisible] = useState(false);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        trigger: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          minHeight: 48,
          borderColor: "rgba(169,169,169,0.5)",
        },
        modalContent: {
          borderRadius: 8,
          padding: 16,
          maxHeight: "80%",
          backgroundColor: colors.background,
        },
      }),
    [colors.background]
  );

  const toggleColor = (colorValue) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]
    );
  };

  const handleDone = () => {
    onChange?.(selectedColors);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={dynamicStyles.trigger} onPress={() => setModalVisible(true)}>
        {selectedColors.length > 0 ? (
          <View style={styles.selectedRow}>
            {selectedColors.map((v) => (
              <View key={v} style={[styles.colorCircle, { backgroundColor: v }]} />
            ))}
          </View>
        ) : (
          <Text>{t("inputs.color.placeholder", { ns: "addPet" })}</Text>
        )}
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}>
          <View style={dynamicStyles.modalContent}>
            <Text style={styles.modalTitle}>{t("inputs.color.placeholder", { ns: "addPet" })}</Text>
            <FlatList
              data={animalsColors}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => {
                const isSelected = selectedColors.includes(item.value);
                return (
                  <TouchableOpacity style={styles.row} onPress={() => toggleColor(item.value)}>
                    <View style={[styles.colorCircle, { backgroundColor: item.value }]} />
                    <Text style={{ marginLeft: 8 }}>{t(`colors.${item.label}`)}</Text>
                    {isSelected && <Text style={{ marginLeft: "auto" }}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <Button mode="contained" onPress={handleDone} style={{ marginTop: 12 }}>
              {t("done", { ns: "common" })}
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectedRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  colorCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "#ccc" },
  row: { flexDirection: "row", alignItems: "center", padding: 12 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalTitle: { fontSize: 18, marginBottom: 12, fontWeight: "bold" },
});
