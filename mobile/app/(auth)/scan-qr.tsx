import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";

import { Button } from "../../src/components/Button";

type InvitePayload = {
  server: string;
  invite: string;
  family_id: string;
};

export default function ScanQr() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");

  const handleScan = (data: string) => {
    if (scanned) return;
    setScanned(true);

    try {
      const payload = JSON.parse(data) as InvitePayload;
      if (!payload.server || !payload.invite || !payload.family_id) {
        throw new Error("Invalid payload");
      }

      router.replace({
        pathname: "/(auth)/join-family",
        params: {
          server: payload.server,
          invite: payload.invite,
          familyId: payload.family_id,
        },
      });
    } catch {
      setError("Invalid QR code. Ask for a new invite.");
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.subtitle}>Requesting camera permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Camera Permission</Text>
          <Text style={styles.subtitle}>We need camera access to scan the invite QR.</Text>
          <Button label="Grant Permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.cameraWrap}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={({ data }) => handleScan(data)}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Align the QR code in the frame</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Cancel" onPress={() => router.back()} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0d3a5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#3f566b",
  },
  cameraWrap: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    padding: 16,
    borderRadius: 12,
  },
  overlayText: {
    fontSize: 15,
    color: "#0d3a5a",
    marginBottom: 10,
  },
  error: {
    color: "#b11d1d",
    marginBottom: 10,
  },
});
