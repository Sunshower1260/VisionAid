import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Bạn cần cấp quyền camera để sử dụng</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync({ base64: true });
      setPhoto(photoData.uri);

      try {
        const res = await fetch("http://10.13.9.131:3000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: photoData.base64 }),
        });

        const data = await res.json();
        console.log("Upload response:", data);

        if (data.audioUrl) {
          const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
          await sound.playAsync();
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {photo ? (
        <Image source={{ uri: photo }} style={{ flex: 1 }} />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.text}>📸 Chụp & Gửi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
  },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
