import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FamilyMember = {
  id: number;
  email: string;
  relation: string;
};

export default function MembershipScreen() {
  const [loading, setLoading] = useState(false);
  const [familyEmail, setFamilyEmail] = useState("");
  const [familyPassword, setFamilyPassword] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyList, setFamilyList] = useState<FamilyMember[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) setUserId(id);
    };
    fetchUserId();
    fetchFamilyList();
  }, []);

  const handleBecomeVolunteer = (role: "member" | "vip") => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn đăng ký trở thành ${role === "vip" ? "tài khoản VIP" : "tình nguyện viên"}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => confirmBecomeVolunteer(role) },
      ]
    );
  };

  const confirmBecomeVolunteer = async (role: "member" | "vip") => {
    if (!userId) return;
    setLoading(true);
    try {
      await fetch(`https://visionaid-be.onrender.com/api/users/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      Alert.alert("✅ Thành công", `Bạn đã trở thành ${role === "vip" ? "VIP" : "tình nguyện viên"}!`);
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Thất bại", "Không thể đăng ký. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const handleAddFamily = async () => {
    if (!userId) return;
    if (!familyEmail || !familyPassword || !familyRelation) {
      Alert.alert("Lỗi", "Vui lòng điền đủ thông tin người mù và quan hệ.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://visionaid-be.onrender.com/api/family/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: familyEmail,
          password: familyPassword,
          relation: familyRelation,
        }),
      });
      const result = await response.json();

      if (result.success) {
        Alert.alert("✅ Thành công", "Đã thêm người mù vào danh sách người nhà!");
        setFamilyEmail("");
        setFamilyPassword("");
        setFamilyRelation("");
        fetchFamilyList();
      } else {
        Alert.alert("❌ Thất bại", result.error || "Không thể thêm người mù.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Lỗi hệ thống", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    }
    setLoading(false);
  };

  const fetchFamilyList = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`https://visionaid-be.onrender.com/api/family/list/${userId}`);
      const result = await response.json();
      if (result.success) setFamilyList(result.family);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f0f4f8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.header}>Trở thành tình nguyện viên / Thêm người nhà</Text>

        {/* Member Card */}
        <TouchableOpacity style={styles.card} onPress={() => handleBecomeVolunteer("member")} disabled={loading}>
          <LinearGradient colors={["#1E90FF", "#004AAD"]} style={styles.gradient}>
            <Text style={styles.cardTitle}>Member</Text>
            <Text style={styles.cardText}>Trở thành tình nguyện viên</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* VIP Card */}
        <TouchableOpacity style={styles.card} onPress={() => handleBecomeVolunteer("vip")} disabled={loading}>
          <LinearGradient colors={["#10B981", "#047857"]} style={styles.gradient}>
            <Text style={styles.cardTitle}>VIP</Text>
            <Text style={styles.cardText}>Trở thành tài khoản trả phí VIP</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Family Card */}
        <View style={styles.card}>
          <LinearGradient colors={["#FBBF24", "#B45309"]} style={styles.gradient}>
            <Text style={styles.cardTitle}>Thêm người nhà</Text>
            <TextInput
              style={styles.input}
              placeholder="Email người mù"
              placeholderTextColor="#555"
              value={familyEmail}
              onChangeText={setFamilyEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu người mù"
              placeholderTextColor="#555"
              secureTextEntry
              value={familyPassword}
              onChangeText={setFamilyPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Quan hệ"
              placeholderTextColor="#555"
              value={familyRelation}
              onChangeText={setFamilyRelation}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddFamily}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Thêm</Text>}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <Text style={[styles.header, { marginTop: 30 }]}>Danh sách người nhà</Text>
        <FlatList
          data={familyList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.familyItem}>
              <Text>{item.email} ({item.relation})</Text>
            </View>
          )}
          scrollEnabled={false} // scroll in ScrollView
          keyboardShouldPersistTaps="handled"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 15 },
  card: {
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: { padding: 20, alignItems: "center" },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  cardText: { fontSize: 14, color: "#fff", textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  button: {
    marginTop: 10,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#2563EB",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  familyItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
