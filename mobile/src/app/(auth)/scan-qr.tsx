import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";

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
      <SafeAreaView>
        <DefaultText text="Requesting camera permissions..." />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView>
        <View>
          <Title text="Camera Permission" />
          <DefaultText text="We need camera access to scan the invite QR." />
          <Button label="Grant Permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <CameraView
        style={{ flex: 1, backgroundColor: "#000000" }}
        onBarcodeScanned={({ data }) => handleScan(data)}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 20,
          right: 20,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          padding: 16,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontSize: 15, color: "#0d3a5a", marginBottom: 10 }}>
          Align the QR code in the frame
        </Text>
        {error ? <Text style={{ color: "#b11d1d", marginBottom: 10 }}>{error}</Text> : null}
        <Button label="Cancel" onPress={() => router.back()} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}
