import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BlindLocation = {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
};

export default function BlindLocationScreen() {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<BlindLocation[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const userId = "3"; // thay bằng userId thật nếu cần
      const res = await fetch(`https://visionaid-be.onrender.com/api/family/last-location/${userId}`);
      const data = await res.json();

      if (data.success && data.location) {
        const loc = data.location;

        // Geocoding để lấy địa chỉ từ lat/lon
        const geocodeRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`
        );
        const geocodeData = await geocodeRes.json();
        const address = geocodeData.display_name || "Không xác định";

        setLocations([{ ...loc, address }]);
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error(err);
      setLocations([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item, index }: { item: BlindLocation; index: number }) => (
    <View style={styles.item}>
      <Text style={styles.text}>
        {item.address}
      </Text>
      <Text style={styles.text}>
        Lat: {item.latitude.toFixed(6)}, Lon: {item.longitude.toFixed(6)}
      </Text>
      <Text style={styles.text}>
        Thời gian: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563EB" />;

  return (
    <FlatList
      data={locations}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={
        <View style={{ padding: 20 }}>
          <Text>Chưa có dữ liệu vị trí.</Text>
        </View>
      }
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: "#111",
    marginBottom: 5,
  },
});
