import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {PERMISSIONS, request} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Mapbox, {UserLocation} from '@rnmapbox/maps';

import {ACCESS_TOKEN} from '@env';

Mapbox.setAccessToken(ACCESS_TOKEN);

const {width, height} = Dimensions.get('window');
const coordinate = [107.5918, -6.8611];

export default function App() {
  const [userLocation, setUserLocation] = useState('');
  const [userCoordinate, setUserCoordinate] = useState([]);
  const [animationDuration, setAnimationDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [checkLocationPermission, setCheckLocationPermission] = useState(false);

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message: 'Aplikasi ini memerlukan izin lokasi.',
            buttonNeutral: 'Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'Izinkan',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              const {longitude, latitude} = position.coords;
              setUserCoordinate([longitude, latitude]);
            },
            error => {
              console.log(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );

          setUserLocation(
            <UserLocation
              visible={true}
              showsUserHeadingIndicator={true}
              onPress={() => console.log('User Location pressed')}
            />,
          );
          setCheckLocationPermission(true);
          console.log('Location permission granted.');
          // Lakukan tindakan jika izin diberikan
        } else {
          setCheckLocationPermission(false);
          setIsVisible(false);
          console.log('Location permission denied.');
          // Lakukan tindakan jika izin ditolak
        }

        setAnimationDuration(1000);
      } catch (error) {
        console.error('Failed to request location permission:', error);
        // Menangani kesalahan dalam meminta izin lokasi
      }
    } else if (Platform.OS === 'ios') {
      // Tambahkan logika untuk meminta izin lokasi di platform iOS
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleToggle = () => {
    if (checkLocationPermission) {
      if (isVisible) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      requestLocationPermission();
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {isVisible && (
            <TouchableOpacity
              style={styles.buttonActive}
              onPress={handleToggle}>
              <Text style={styles.buttonText}>GPS Aktif</Text>
            </TouchableOpacity>
          )}
          {!isVisible && (
            <TouchableOpacity
              style={styles.buttonInactive}
              onPress={handleToggle}>
              <Text style={styles.buttonText}>GPS Mati</Text>
            </TouchableOpacity>
          )}
        </View>
        <Mapbox.MapView
          styleURL="mapbox://styles/mapbox/outdoors-v12"
          style={styles.map}
          compassEnabled={true}
          projection="globe">
          {isVisible && (
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={
                userCoordinate.length === 0 ? coordinate : userCoordinate
              }
              animationDuration={animationDuration}
            />
          )}
          {!isVisible && <Mapbox.Camera />}
          {isVisible && userLocation}
          {!isVisible && (
            <UserLocation
              visible={false}
              showsUserHeadingIndicator={true}
              onPress={() => console.log('User Location pressed')}
            />
          )}
        </Mapbox.MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    height: height,
    width: width,
    backgroundColor: 'wheat',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  buttonActive: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonInactive: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
