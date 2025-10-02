import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  const onLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.13.9.131:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/(tabs)/main");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>VisionAid</Text>
      <Text style={styles.subtitle}>Hỗ trợ người khiếm thị</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.rememberMeContainer}>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
        <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(tabs)/register")}>
        <Text style={{ color: "#2563EB", marginTop: 12 }}>
          Chưa có tài khoản? Đăng ký
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4, color: "#111827" },
  subtitle: { fontSize: 16, marginBottom: 24, color: "#6B7280" },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#2563EB",
    marginBottom: 24,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  steps: {
    width: "100%",
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  stepTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#111827" },
  step: { fontSize: 15, marginBottom: 4, color: "#374151" },
  rememberMeContainer: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginBottom: 16 },
  rememberMeText: { marginLeft: 8, fontSize: 15, color: "#374151" },
});
