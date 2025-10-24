import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";

type Volunteer = {
  id: number;
  email: string;
  latitude: number;
  longitude: number;
  distance_km: number;
};

export default function VolunteerScreen() {
  const [loading, setLoading] = useState(false);
  const [nearest, setNearest] = useState<Volunteer | null>(null);

  const handleFindVolunteer = async () => {
    setLoading(true);
    setNearest(null);

    try {
      // 1️⃣ Xin quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập vị trí để tìm tình nguyện viên.");
        setLoading(false);
        return;
      }

      // 2️⃣ Lấy tọa độ hiện tại
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3️⃣ Gửi yêu cầu lên API server Node
      const response = await fetch("http://192.168.1.9:3000/api/volunteer/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await response.json();

      if (result.success) {
        setNearest(result.nearestVolunteer); // 👈 lưu volunteer gần nhất
        Alert.alert("✅ Tìm thấy tình nguyện viên!", `Gần nhất: ${result.nearestVolunteer.email}`);
      } else {
        Alert.alert("❌ Không tìm thấy", result.message || "Không có tình nguyện viên hoạt động.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi hệ thống", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm tình nguyện viên</Text>
      <Text style={styles.subtitle}>
        Ứng dụng sẽ sử dụng vị trí hiện tại của bạn để tìm người hỗ trợ gần nhất.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleFindVolunteer} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi yêu cầu hỗ trợ</Text>
        )}
      </TouchableOpacity>

      {/* 📍 Hiển thị volunteer gần nhất */}
      {nearest && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>📍 Người gần bạn nhất:</Text>
          <Text style={styles.resultDetail}>Email: {nearest.email}</Text>
          <Text style={styles.resultDetail}>
            Khoảng cách: {nearest.distance_km.toFixed(2)} km
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "#004AAD", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#333", marginBottom: 30 },
  button: { backgroundColor: "#2563EB", paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resultBox: { marginTop: 30, backgroundColor: "#E0F2FE", padding: 15, borderRadius: 10, width: "90%" },
  resultText: { fontSize: 18, fontWeight: "bold", color: "#004AAD" },
  resultDetail: { fontSize: 16, color: "#333", marginTop: 5 },
});
