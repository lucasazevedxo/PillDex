import React from "react";
import { Modal, View, Text } from "react-native";
import { Button } from "./UI";
import { s } from "../styles/theme";
export default function Confirm({ title, visible, busy, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !busy && onCancel()}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          accessibilityViewIsModal
          style={[
            s.card,
            { maxWidth: 520, width: "100%", alignSelf: "center" },
          ]}
        >
          <Text style={s.name}>{title}</Text>
          <Button
            title="Confirmar remoção"
            disabled={busy}
            onPress={onConfirm}
          />
          <Button title="Cancelar" disabled={busy} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
