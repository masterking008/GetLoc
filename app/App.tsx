
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Button, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Polygon } from 'react-native-maps';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null); // Selected user
  const [mode, setMode] = useState(null); // Mode selection: 'gps' or 'manual'
  const [coordinates, setCoordinates] = useState(null); // State to store coordinates
  const [loading, setLoading] = useState(false); // Loading indicator
  const [zone, setZone] = useState(null); // Zone number
  const [feedback, setFeedback] = useState(''); // Feedback input
  const [submitted, setSubmitted] = useState(false); // Feedback submission status


  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://172.20.10.5:8000/api/users/');
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [mapRegion, setMapRegion] = useState({
    latitude: 19.1334,
    longitude: 72.9133,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [zones, setZones] = useState([]);

  useEffect(() => {
    axios.get('http://172.20.10.5:8000/api/zones/')
      .then(response => {
        setZones(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const resetState = () => {
    setCoordinates(null);
    setZone(null);
    setMode(null);
    setFeedback('');
    setSubmitted(false);
  };

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

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoordinates({ latitude, longitude });
    determineZone(latitude, longitude);
  };

  const determineZone = (latitude, longitude) => {
    const pointInPolygon = require('point-in-polygon');
    for (const zone of zones) {
      const polygon = zone.coordinates.map((coord) => [coord.latitude, coord.longitude]);
      if (pointInPolygon([latitude, longitude], polygon)) {
        setZone(zone.id);
        return;
      }
    }
    setZone(null); // Not in any zone
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }
  
    try {
      const response = await axios.post('http://172.20.10.5:8000/api/submit-feedback/', {
        user_name: user.name, // user name
        zone_id: zone, // selected zone
        feedback_text: feedback, // feedback entered by the user
      });
  
      if (response.status === 201) {
        setSubmitted(true);
        Alert.alert('Success', 'Your feedback has been submitted');
      } else {
        Alert.alert('Error', 'There was an issue submitting your feedback');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to submit feedback');
    }
  };

  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modeSelectionContainer}>
          <Text style={styles.title}>Select User</Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            users.map((user) => (
              <Button
                key={user.id}
                title={user.name}
                onPress={() => setUser(user)}
                />
            ))
          )}
        </View>
      </SafeAreaView>
    );
  }

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
                <>
                  <Text style={styles.zoneText}>Zone: {zone}</Text>
                  {!submitted && (
                    <View style={styles.feedbackContainer}>
                      <TextInput
                        style={styles.feedbackInput}
                        placeholder="Enter your feedback"
                        value={feedback}
                        onChangeText={setFeedback}
                      />
                      <Button title="Submit Feedback" onPress={handleSubmitFeedback} color="#28A745" />
                    </View>
                  )}
                </>
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
            {coordinates && (
              <Marker coordinate={coordinates} />
            )}
          </MapView>
          {coordinates && (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude}
              </Text>
              {zone ? (
                <>
                  <Text style={styles.zoneText}>Zone: {zone}</Text>
                  {!submitted && (
                    <View style={styles.feedbackContainer}>
                      <TextInput
                        style={styles.feedbackInput}
                        placeholder="Enter your feedback"
                        value={feedback}
                        onChangeText={setFeedback}
                      />
                      <Button title="Submit Feedback" onPress={handleSubmitFeedback} color="#28A745" />
                    </View>
                  )}
                </>
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

export default App;

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
  feedbackContainer: {
    marginTop: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
