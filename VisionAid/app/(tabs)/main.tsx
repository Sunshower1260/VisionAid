import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function MainScreen() {
  const router = useRouter();

  const handlePress = (label: string) => {
    if (label === "Camera") {
      router.push("/CameraScreen");
    } else if (label === "SOS") {
      router.push("/VolunteerScreen");
    } else {
      Alert.alert(`Bạn đã bấm nút: ${label}`);
    }
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    const { translationY } = event;

    if (translationY < -50) {
      router.push("/CameraScreen");
    } else if (translationY > 50) {
      router.push("/VolunteerScreen");
    }
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          {/* Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.name}>Đăng Duy!</Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress("Camera")}
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
              onPress={() => handlePress("SOS")}
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
              <Text style={styles.cardText}>Mua gói thành viên</Text>
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
