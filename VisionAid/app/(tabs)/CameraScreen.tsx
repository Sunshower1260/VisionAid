import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResultShown, setIsResultShown] = useState(false); 

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
    if (isResultShown) {
      setPhoto(null);
      setIsResultShown(false);
      return;
    }

    if (!cameraRef.current) return;

    setLoading(true);
    try {
      console.log("📸 Bắt đầu chụp ảnh...");
      const photoData = await cameraRef.current.takePictureAsync({ base64: true });
      console.log("✅ Ảnh đã chụp:", photoData.uri);
      setPhoto(photoData.uri);

      console.log("📤 Gửi ảnh lên server...");
      const res = await fetch("https://visionaid-be.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photoData.base64 }),
      });

      console.log("📥 Nhận phản hồi thô...");
      const textResponse = await res.text();
      console.log("🧾 Raw response:", textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        console.error("❌ Lỗi parse JSON:", parseErr);
        Alert.alert("Lỗi phản hồi", "Server trả về dữ liệu không hợp lệ");
        return;
      }

      console.log("✅ JSON hợp lệ:", data);

      if (data.success && data.text) {
        let contentToSpeak = data.text.trim();

        const match = data.text.match(/Nội dung[:：]\s*(.*)/s);
        if (match && match[1]) contentToSpeak = match[1].trim();

        if (/^Thể loại:/i.test(contentToSpeak) && !match) {
          console.warn("⏭️ Không có nội dung thực tế để đọc.");
          setIsResultShown(true);
          return;
        }

        console.log("🔊 Gọi Speech.speak với nội dung:", contentToSpeak);
        Speech.stop();

        Speech.speak(contentToSpeak, {
          language: "vi-VN",
          rate: 1.0,
          pitch: 1.0,
          onStart: () => console.log("🎙️ Bắt đầu đọc..."),
          onDone: () => {
            console.log("✅ Đọc xong!");
            setIsResultShown(true); // ✅ Cho phép bấm “Chụp lại”
          },
          onError: (e) => {
            console.error("❌ Lỗi khi đọc:", e);
            setIsResultShown(true);
          },
        });
      } else {
        console.warn("⚠️ Server không trả về text:", data);
        Alert.alert("Phân tích thất bại", data.error || "Không nhận được nội dung từ server");
        setIsResultShown(true);
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi gửi ảnh:", err);
      Alert.alert("Lỗi", err.message || "Không thể gửi ảnh đến server");
      setIsResultShown(true);
    } finally {
      setLoading(false);
      console.log("📷 Hoàn tất xử lý.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {photo && isResultShown ? (
        <Image source={{ uri: photo }} style={{ flex: 1 }} />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 8 }}>Đang xử lý...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={takePhoto}
        disabled={loading}
      >
        <Text style={styles.text}>
          {isResultShown ? "📸 Chụp lại & Phân tích" : "📸 Chụp & Phân tích"}
        </Text>
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
