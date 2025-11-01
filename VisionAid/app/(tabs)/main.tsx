import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export default function MainScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lastPressed, setLastPressed] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchUser = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      const id = await AsyncStorage.getItem("userId");
      const role = await AsyncStorage.getItem("userRole"); // member / vip / user
      if (email) setUserEmail(email);
      if (id) setUserId(id);
      if (role) setUserRole(role);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const updateLocation = async () => {
      if (!userId || !userRole) return;
      if (userRole !== "member" && userRole !== "vip") return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        await fetch("https://visionaid-be.onrender.com/api/volunteer/update-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, latitude, longitude }),
        });
      } catch (err) {
        console.error("Auto update location error:", err);
      }
    };

    updateLocation();
  }, [userId, userRole]);

  const handlePress = async (label: string) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 1500; // 1.5 giây

    if (lastPressed[label] && now - lastPressed[label] < DOUBLE_PRESS_DELAY) {
      // Nhấn lần 2 -> thực hiện chức năng
      if (label === "Nhận diện vật thể") {
        router.push("/CameraScreen");
      } else if (label === "Trợ giúp khẩn cấp") {
        const role = await AsyncStorage.getItem("userRole");
        if (role === "member" || role === "vip") {
          router.push("/VolunteerDashboard");
        } else {
          router.push("/VolunteerScreen");
        }
      } else if (label === "Membership") {
        router.push("/MembershipScreen");
      }
    } else {
      // Nhấn lần 1 -> đọc giọng nói cảnh báo
      Speech.speak(`Bạn đã bấm vào ${label}. Bấm lại lần nữa để truy cập tính năng.`);
      setLastPressed((prev) => ({ ...prev, [label]: now }));
    }
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    "worklet";
    const { translationY } = event;
    if (translationY === undefined) return;
    if (translationY < -50) runOnJS(router.push)("/CameraScreen");
    else if (translationY > 50) runOnJS(router.push)("/VolunteerScreen");
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          {/* Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.name}>{userEmail || "Người dùng"}</Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress("Nhận diện vật thể")}
            >
              <View style={styles.cardIcons}>
                <Image
                  source={require("../../assets/images/blind_icon.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Image
                  source={require("../../assets/images/scan_icon.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.cardText}>
                Điều hướng và nhận diện{"\n"}môi trường an toàn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress("Trợ giúp khẩn cấp")}
            >
              <View style={styles.cardIcons}>
                <Image
                  source={require("../../assets/images/sos_icon.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Image
                  source={require("../../assets/images/community_icon.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.cardText}>Trợ giúp khẩn cấp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress("Membership")}
            >
              <View style={styles.cardIcons}>
                <Image
                  source={require("../../assets/images/add_user.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Image
                  source={require("../../assets/images/settings.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.cardText}>Trở thành tình nguyện viên</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },
  cardContainer: {
    alignItems: "center",
    gap: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 25,
  },
  icon: {
    width: 60,
    height: 60,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
});
