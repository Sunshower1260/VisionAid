import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/placeholder.png")} // đổi đúng tên file logo của bạn
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App name */}
      <Text style={styles.appName}>Vision Aid</Text>

      {/* Slogan */}
      <Text style={styles.title}>LÀM CHỦ TẦM NHÌN</Text>
      <Text style={styles.subtitle}>
        Hãy để VISION AID trở thành đôi mắt của bạn
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={["#4DB5FF", "#004AAD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/register")} // 👉 điều hướng sang RegisterScreen
          >
            <Text style={styles.buttonTextBold}>Bắt đầu - Đăng ký</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#4DB5FF", "#004AAD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/login")} // 👉 điều hướng sang LoginScreen
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: "600",
    color: "#004AAD",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  buttonTextBold: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
