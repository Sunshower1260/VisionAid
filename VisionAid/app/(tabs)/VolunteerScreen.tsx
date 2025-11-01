import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [lastPressed, setLastPressed] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  const DOUBLE_PRESS_DELAY = 1500; // 1.5 giây

  const handleDoublePress = async (label: string, action: () => void) => {
    const now = Date.now();

    if (lastPressed[label] && now - lastPressed[label] < DOUBLE_PRESS_DELAY) {
      // Nhấn lần 2 -> thực hiện hành động
      action();
    } else {
      // Nhấn lần 1 -> đọc giọng nói
      Speech.speak(`Bạn đã bấm vào ${label}. Bấm lại lần nữa để truy cập tính năng.`);
      setLastPressed((prev) => ({ ...prev, [label]: now }));
    }
  };

  const handleFindVolunteer = async () => {
    setLoading(true);
    setNearest(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập vị trí để tìm tình nguyện viên.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch("https://visionaid-be.onrender.com/api/volunteer/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await response.json();

      if (result.success) {
        setNearest(result.nearestVolunteer);
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

  const sendLocationToFamily = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập vị trí.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch("https://visionaid-be.onrender.com/api/family/send-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, latitude, longitude }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("✅ Thành công", "Đã gửi vị trí của bạn cho người thân!");
      } else {
        Alert.alert("❌ Thất bại", result.error || "Không thể gửi vị trí.");
      }
    } catch (error) {
      console.error("Send location error:", error);
      Alert.alert("Lỗi hệ thống", "Không thể gửi vị trí. Vui lòng thử lại sau.");
    }
  };

  const goToBlindLocation = () => {
    router.push("/BlindLocationScreen");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trợ giúp khẩn cấp</Text>
        <Text style={styles.subtitle}>Chọn hành động bạn muốn thực hiện</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          disabled={loading}
          onPress={() => handleDoublePress("Gửi yêu cầu hỗ trợ", handleFindVolunteer)}
        >
          <View style={styles.cardIcons}>
            <Image source={require("../../assets/images/sos_icon.png")} style={styles.icon} resizeMode="contain" />
            <Image source={require("../../assets/images/community_icon.png")} style={styles.icon} resizeMode="contain" />
          </View>
          {loading ? <ActivityIndicator color="#004AAD" /> : <Text style={styles.cardText}>Gửi yêu cầu hỗ trợ</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#ECFDF5" }]}
          onPress={() => handleDoublePress("Gửi vị trí cho người thân", sendLocationToFamily)}
        >
          <View style={styles.cardIcons}>
            <Image source={require("../../assets/images/blind_icon.png")} style={styles.icon} resizeMode="contain" />
            <Image source={require("../../assets/images/home.png")} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={[styles.cardText, { color: "#065F46" }]}>Gửi vị trí cho người thân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#FFF7ED" }]}
          onPress={() => handleDoublePress("Xem vị trí người mù", goToBlindLocation)}
        >
          <View style={styles.cardIcons}>
            <Image source={require("../../assets/images/menu.png")} style={styles.icon} resizeMode="contain" />
            <Image source={require("../../assets/images/community_icon.png")} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={[styles.cardText, { color: "#B45309" }]}>Xem vị trí người mù</Text>
        </TouchableOpacity>
      </View>

      {/* Result Box */}
      {nearest && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>📍 Người gần bạn nhất</Text>
          <Text style={styles.resultDetail}>Email: {nearest.email}</Text>
          <Text style={styles.resultDetail}>Khoảng cách: {nearest.distance_km.toFixed(2)} km</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "bold", color: "#004AAD" },
  subtitle: { fontSize: 16, color: "#444", marginTop: 5 },
  cardContainer: { alignItems: "center", gap: 20 },
  card: {
    width: "90%",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 25,
  },
  icon: { width: 60, height: 60 },
  cardText: { fontSize: 17, fontWeight: "600", color: "#004AAD", textAlign: "center" },
  resultBox: {
    marginTop: 30,
    backgroundColor: "#E0F2FE",
    padding: 15,
    borderRadius: 12,
    width: "90%",
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: "#004AAD", marginBottom: 8 },
  resultDetail: { fontSize: 16, color: "#333" },
});
