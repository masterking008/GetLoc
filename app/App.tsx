import React, { useState } from 'react';
import { StyleSheet, Text, Button, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Polygon } from 'react-native-maps';

const HomeScreen2 = () => {
  const [mode, setMode] = useState(null); // Mode selection: 'gps' or 'manual'
  const [coordinates, setCoordinates] = useState(null); // State to store coordinates
  const [loading, setLoading] = useState(false); // Loading indicator
  const [pinnedLocation, setPinnedLocation] = useState({
    latitude: 19.1334, // IIT Bombay Latitude
    longitude: 72.9133, // IIT Bombay Longitude
  }); // Initial pinned location
  const [zone, setZone] = useState(null); // Zone number

  const [mapRegion, setMapRegion] = useState({
    latitude: 19.1334,
    longitude: 72.9133,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Define zones as polygons
  const zones = [
    {
      id: 1,
      coordinates: [
        { latitude: 19.1330, longitude: 72.9110 },
        { latitude: 19.1340, longitude: 72.9110 },
        { latitude: 19.1340, longitude: 72.9120 },
        { latitude: 19.1330, longitude: 72.9120 },
      ],
    },
    {
      id: 2,
      coordinates: [
        { latitude: 19.1340, longitude: 72.9120 },
        { latitude: 19.1350, longitude: 72.9120 },
        { latitude: 19.1350, longitude: 72.9130 },
        { latitude: 19.1340, longitude: 72.9130 },
      ],
    },
    {
      id: 3,
      coordinates: [
        { latitude: 19.1330, longitude: 72.9130 },
        { latitude: 19.1340, longitude: 72.9130 },
        { latitude: 19.1340, longitude: 72.9140 },
        { latitude: 19.1330, longitude: 72.9140 },
      ],
    },
    {
      id: 4,
      coordinates: [
        { latitude: 19.1320, longitude: 72.9110 },
        { latitude: 19.1330, longitude: 72.9110 },
        { latitude: 19.1330, longitude: 72.9120 },
        { latitude: 19.1320, longitude: 72.9120 },
      ],
    },
    {
      id: 5,
      coordinates: [
        { latitude: 19.1350, longitude: 72.9120 },
        { latitude: 19.1360, longitude: 72.9120 },
        { latitude: 19.1360, longitude: 72.9130 },
        { latitude: 19.1350, longitude: 72.9130 },
      ],
    },
    {
      id: 6,
      coordinates: [
        { latitude: 19.1320, longitude: 72.9120 },
        { latitude: 19.1330, longitude: 72.9120 },
        { latitude: 19.1330, longitude: 72.9130 },
        { latitude: 19.1320, longitude: 72.9130 },
      ],
    },
    {
      id: 7,
      coordinates: [
        { latitude: 19.1360, longitude: 72.9110 },
        { latitude: 19.1370, longitude: 72.9110 },
        { latitude: 19.1370, longitude: 72.9120 },
        { latitude: 19.1360, longitude: 72.9120 },
      ],
    },
    {
      id: 8,
      coordinates: [
        { latitude: 19.1370, longitude: 72.9120 },
        { latitude: 19.1380, longitude: 72.9120 },
        { latitude: 19.1380, longitude: 72.9130 },
        { latitude: 19.1370, longitude: 72.9130 },
      ],
    },
    {
      id: 9,
      coordinates: [
        { latitude: 19.1310, longitude: 72.9110 },
        { latitude: 19.1320, longitude: 72.9110 },
        { latitude: 19.1320, longitude: 72.9120 },
        { latitude: 19.1310, longitude: 72.9120 },
      ],
    },
    {
      id: 10,
      coordinates: [
        { latitude: 19.1350, longitude: 72.9130 },
        { latitude: 19.1360, longitude: 72.9130 },
        { latitude: 19.1360, longitude: 72.9140 },
        { latitude: 19.1350, longitude: 72.9140 },
      ],
    },
    {
      id: 11,
      coordinates: [
        { latitude: 19.1300, longitude: 72.9120 },
        { latitude: 19.1310, longitude: 72.9120 },
        { latitude: 19.1310, longitude: 72.9130 },
        { latitude: 19.1300, longitude: 72.9130 },
      ],
    },
    {
      id: 12,
      coordinates: [
        { latitude: 19.1320, longitude: 72.9140 },
        { latitude: 19.1330, longitude: 72.9140 },
        { latitude: 19.1330, longitude: 72.9150 },
        { latitude: 19.1320, longitude: 72.9150 },
      ],
    },
  ];

  // Reset coordinates and mode
  const resetState = () => {
    setCoordinates(null);
    setPinnedLocation({
      latitude: 19.1334,
      longitude: 72.9133,
    });
    setZone(null);
    setMode(null);
  };

  // Get current location using GPS
  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow the app to use the location services');
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      if (coords) {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        determineZone(coords.latitude, coords.longitude);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch location');
    } finally {
      setLoading(false);
    }
  };

  // Handle map press to update pinned location
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPinnedLocation({ latitude, longitude });
    determineZone(latitude, longitude);
  };

  // Determine which zone the coordinates belong to
  const determineZone = (latitude, longitude) => {
    const pointInPolygon = require('point-in-polygon'); // Install this package using npm
    for (const zone of zones) {
      const polygon = zone.coordinates.map((coord) => [coord.latitude, coord.longitude]);
      if (pointInPolygon([latitude, longitude], polygon)) {
        setZone(zone.id);
        return;
      }
    }
    setZone(null); // Not in any zone
  };

  // Fetch pinned coordinates
  const getPinnedCoordinates = () => {
    setCoordinates(pinnedLocation);
  };

  // Render mode selection screen
  if (!mode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modeSelectionContainer}>
          <Text style={styles.title}>Select Mode</Text>
          <Button title="Use GPS" onPress={() => setMode('gps')} color="#007BFF" />
          <View style={styles.separator} />
          <Button title="Select on Map" onPress={() => setMode('manual')} color="#007BFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Change Mode" onPress={resetState} color="#FF6347" />
      </View>
      {mode === 'gps' ? (
        <View style={styles.content}>
          <Button title="Get Coordinates" onPress={getCurrentLocation} color="#007BFF" />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
          ) : coordinates ? (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude}
              </Text>
              {zone ? (
                <Text style={styles.zoneText}>Zone: {zone}</Text>
              ) : (
                <Text style={styles.zoneText}>This location is not in any zone.</Text>
              )}
            </View>
          ) : (
            <Text style={styles.loadingText}>Press the button to fetch coordinates</Text>
          )}
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            {zones.map((zone) => (
              <Polygon
                key={zone.id}
                coordinates={zone.coordinates}
                fillColor="rgba(0, 150, 255, 0.3)"
                strokeColor="#007BFF"
              />
            ))}
            <Marker coordinate={pinnedLocation} draggable />
          </MapView>
          <View style={styles.pinnedButton}>
            <Button title="Get Pinned Coordinates" onPress={getPinnedCoordinates} color="#007BFF" />
          </View>
          {coordinates && (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude}
              </Text>
              {zone ? (
                <Text style={styles.zoneText}>Zone: {zone}</Text>
              ) : (
                <Text style={styles.zoneText}>This location is not in any zone.</Text>
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  modeSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    height: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    marginTop: 20,
  },
  coordinatesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  coordinatesText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  zoneText: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    height: 400,
    width: 400,
  },
  pinnedButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});
