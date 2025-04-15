import React, { useState, useEffect, useCallback } from 'react';
import { View, Button, Alert } from 'react-native';
import { MarkerData } from '@/types';
import 'react-native-get-random-values';
import { useRouter, useFocusEffect } from 'expo-router';
import Map from '../components/Map';
import { useDatabase } from '@/context/DatabaseContext';
import { requestLocationPermissions, startLocationUpdates, calculateDistance} from "@/services/location";
import { NotificationManager } from "@/services/notifications";
import * as Location from "expo-location";

const PROXIMITY_THRESHOLD = 100;

export default function Index() {
  const {addMarker, getMarkers, deleteMarker} = useDatabase();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const router = useRouter();

  const notificationManager = React.useRef(new NotificationManager()).current;
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null> (null);

  useFocusEffect(useCallback(() => {
    const loadData = async () => {
      const loadedMarkers = await getMarkers();
      setMarkers(loadedMarkers);
    };
    loadData();
    console.log(markers);
  }, [getMarkers]));

  useEffect(() => {

    let locationSubscription: Location.LocationSubscription;

    const setupLocation = async () => {
      try{
        await requestLocationPermissions();
        locationSubscription = await startLocationUpdates((location) => {
          setUserLocation(location.coords);
          checkProximity(location, markers);
        });
      }catch(error){
        console.error("Ошибка геолокации: ", error);
      }
    };

    setupLocation();

    return () => {
      if(locationSubscription){
        locationSubscription.remove();
      }
    };
  }, [markers])

  const checkProximity = (
    userLocation: Location.LocationObject,
    markers: MarkerData[]
  ) => {
    markers.forEach(marker => {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        marker.latitude,
        marker.longitude
      );
      notificationManager.requestNotificationPermission();
      if (distance <= PROXIMITY_THRESHOLD){
        notificationManager.showNotification(marker);
      }else{
        notificationManager.removeNotification(marker.id);
      }
    });
  };

  const pressingMap = (event: any) => {
    const { coordinate } = event.nativeEvent;
    addMarkerHere(coordinate.latitude, coordinate.longitude);
  };

  const addMarkerHere = async (latitude: number, longitude: number) => {
    await addMarker(latitude, longitude);
    const updatedMarkers = await getMarkers();
    setMarkers(updatedMarkers);
    console.log(markers);
  };

  const tappingMarker = (marker: MarkerData) => {
    try {
      router.push({
        pathname: '/marker/[id]',
        params: {
          id: marker.id,
          marker: JSON.stringify(marker)
        }
      });
    }catch(error){
      console.error("Ошибка навигации: ", error);
      Alert.alert("Ошибка", "Ошибка навигации к маркеру");
    }
  };

  const clearMarkers = async () => {{
    const markersToDelete = [...markers];
    setMarkers([]);
    for (const marker of markersToDelete){
      await deleteMarker(marker.id);
    }
  }};

  return (
    <View style={{flex: 1}}>      
      <Map
        markers={markers}
        pressingMap={pressingMap}
        tappingMarker={tappingMarker}
        userLocation={userLocation}
        proximityThreshold={PROXIMITY_THRESHOLD}
      />
      <View style={{position: 'absolute', padding: 10, paddingTop: 60}}>
        <Button
          title='clear'
          onPress={clearMarkers}
          color = '#FF3B30'
        />
      </View>
    </View>
  );
}


