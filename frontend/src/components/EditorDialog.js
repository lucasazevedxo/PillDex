import React from "react";
import { Modal, View, ScrollView } from "react-native";
export default function EditorDialog({ children, onClose }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 650,
            maxHeight: "90%",
            alignSelf: "center",
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
