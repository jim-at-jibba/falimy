import { AlertTriangle } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";
import Title from "./Title";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ visible, onClose, onConfirm }: DeleteAccountModalProps) {
  const { theme } = useUnistyles();

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <AlertTriangle size={48} color={theme.colors.error} style={styles.icon} />
          <Title text="Delete Account?" additionalStyles={styles.modalTitle} />
          <DefaultText
            text={`Are you sure you want to delete your account? This action is irreversible.\n\nProcessing may take up to 30 days to complete.`}
            additionalStyles={styles.modalText}
          />

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.buttonCancel]} onPress={onClose}>
              <DefaultText text="Cancel" additionalStyles={styles.textStyleCancel} />
            </Pressable>
            <Pressable style={[styles.button, styles.buttonConfirm]} onPress={onConfirm}>
              <DefaultText text="Confirm Deletion" additionalStyles={styles.textStyleConfirm} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: theme.spacing[4],
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadiusMd,
    padding: theme.spacing[5],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  icon: {
    marginBottom: theme.spacing[2],
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold",
    marginBottom: theme.spacing[3],
    textAlign: "center",
    color: theme.colors.typography,
  },
  modalText: {
    marginBottom: theme.spacing[2],
    textAlign: "center",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.grey,
    lineHeight: theme.fontSizes.sm * 1.4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing[4],
  },
  button: {
    borderRadius: theme.borderRadiusSm,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    elevation: 2,
    minWidth: 120,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonConfirm: {
    backgroundColor: theme.colors.error,
  },
  textStyleCancel: {
    color: theme.colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyleConfirm: {
    color: theme.colors.white,
    fontWeight: "bold",
    textAlign: "center",
  },
}));
