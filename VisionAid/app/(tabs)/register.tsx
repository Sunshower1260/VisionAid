import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const onRegister = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.13:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.back();
      } else {
        alert(data.error || "Đăng ký thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#4DB6FF", "#001E4D"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/placeholder.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Icon camera */}
          <TouchableOpacity style={styles.cameraContainer}>
            <Ionicons name="camera-outline" size={36} color="#000" />
            <View style={styles.plusCircle}>
              <Ionicons name="add" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Hoàn thành{"\n"}tạo tài khoản</Text>

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Số điện thoại */}
          <TextInput style={styles.input} placeholder="Số điện thoại" />

          {/* Mật khẩu */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          {/* Điều khoản */}
          <Text style={styles.terms}>
            Bấm “đăng ký” đồng nghĩa với việc bạn sẽ đồng ý với các điều khoản
            của chúng tôi trong quá trình sử dụng
          </Text>

          <TouchableOpacity>
            <Text style={styles.link}>Xem điều khoản</Text>
          </TouchableOpacity>

          {/* Button gradient */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={onRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={["#1E90FF", "#004AAD"]}
              style={styles.registerButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Bắt đầu - Đăng ký</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Link đăng nhập */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Đăng nhập ngay!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  cameraContainer: {
    position: "absolute",
    top: 40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  plusCircle: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#004AAD",
    borderRadius: 10,
    padding: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 14,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
    marginBottom: 10,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  terms: {
    fontSize: 13,
    color: "#000",
    marginTop: 8,
    textAlign: "left",
  },
  link: {
    color: "#004AAD",
    fontSize: 14,
    textDecorationLine: "underline",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  buttonWrapper: {
    width: "100%",
    marginTop: 16,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#000",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#000",
  },
});
