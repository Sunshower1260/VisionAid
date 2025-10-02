import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onRegister = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://10.13.9.131:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.back();
        alert(data.error || "Đăng ký thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.registerButton} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.registerButtonText}>Đăng ký</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#F9FAFB" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 24, color: "#111827" },
  input: { width: "100%", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#D1D5DB", marginBottom: 12, backgroundColor: "#fff" },
  registerButton: { width: "100%", padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#10B981", marginTop: 10 },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
