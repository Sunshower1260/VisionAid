import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const router = useRouter();

  const onLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.9:3000/login", {
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
    <LinearGradient
      colors={["#5EB8FF", "#052136"]} 
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/placeholder.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title + avatar icon (row) */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.greetText}>Chào mừng bạn{"\n"}đã trở lại!</Text>
            </View>

            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={36} color="#111827" />
            </View>
          </View>

          {/* Inputs */}
          <TextInput
            style={styles.input}
            placeholder="Email/ Số điện thoại"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              placeholder="Mật khẩu"
              placeholderTextColor="#6B7280"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Remember switch */}
          <View style={styles.rememberRow}>
            <Switch value={rememberMe} onValueChange={setRememberMe} />
            <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
          </View>

          {/* Button: use LinearGradient inside */}
          <TouchableOpacity onPress={onLogin} disabled={loading} style={{ width: "100%" }}>
            <LinearGradient colors={["#2A7BD7", "#0A3A66"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginButton}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerContainer}>
            <Text style={styles.regText}>Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/register")}>
              <Text style={styles.regLink}> Đăng kí ngay!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  card: {
    width: "96%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.98)", 
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 72,
    height: 48,
    marginBottom: 8,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  titleWrap: {
    flex: 1,
  },
  greetText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
    lineHeight: 30,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.6,
    borderColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1.2,
    borderColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#111827",
  },
  passwordRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#111827",
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  forgotWrap: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  forgotText: {
    textDecorationLine: "underline",
    color: "#111827",
    fontSize: 14,
  },
  rememberRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rememberText: {
    marginLeft: 8,
    color: "#111827",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A3A66",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 18,
  },
  regText: {
    color: "#111827",
  },
  regLink: {
    color: "#0A4BB8",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
