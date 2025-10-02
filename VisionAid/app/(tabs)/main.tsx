import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router"; // <-- hook

export default function MainScreen() {
  const router = useRouter(); // <-- tạo router

  const handlePress = (label: string) => {
    if (label === "Camera") {
      router.push("/CameraScreen"); // <-- dùng push thay cho navigate
    } else {
      Alert.alert(`Bạn đã bấm nút: ${label}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2563EB" }]}
        onPress={() => handlePress("Camera")}
      >
        <Text style={styles.buttonText}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#10B981" }]}
        onPress={() => handlePress("GPS")}
      >
        <Text style={styles.buttonText}>Định vị cho người thân</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F59E0B" }]}
        onPress={() => handlePress("Membership")}
      >
        <Text style={styles.buttonText}>Mua gói thành viên</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { fontSize: 28, fontWeight: "bold", color: "#fff" },
});
