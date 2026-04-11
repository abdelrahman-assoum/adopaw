import { Modal, ActivityIndicator, View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const LoadingModal = ({ loading }) => {
  const { colors } = useTheme();
  return (
    <Modal transparent visible={loading}>
      <View style={styles.modalBackground}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default LoadingModal;
