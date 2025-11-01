import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VolunteerRequest = {
  id: number;
  requester_email: string;
  latitude: number;
  longitude: number;
  status: string;
};

export default function VolunteerDashboard() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]); 

  const volunteerId = 2; 

  const fetchRequests = async () => {
    try {
      const response = await fetch(`https://visionaid-be.onrender.com/api/volunteer/requests/${volunteerId}`);
      const data = await response.json();
      if (data.success) setRequests(data.requests);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      const response = await fetch("https://visionaid-be.onrender.com/api/volunteer/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("✅ Thành công", "Bạn đã nhận hỗ trợ người dùng!");
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Danh sách yêu cầu hỗ trợ</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>👤 Người yêu cầu: {item.requester_email}</Text>
            <Text>📍 Tọa độ: {item.latitude}, {item.longitude}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.buttonText}>Nhận hỗ trợ</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#E0F2FE",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
