import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { ImageData, MarkerData } from "@/types";
import { View, Text, Button, Alert } from "react-native";
import ImageList from "@/components/ImageList";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from 'react';
import { useDatabase } from "@/context/DatabaseContext";

export default function MarkerInfo() {
    const { id, marker: markerString} = useLocalSearchParams<{
        id: string;
        marker: string;
    }>();
    const {getMarkers, addImage: plusImage, getMarkerImages, deleteImage: minusImage, deleteMarker: minusMarker} = useDatabase();
    const [marker, setMarker] = useState<MarkerData>(JSON.parse(markerString || '{}'));
    const [images, setImages] = useState<ImageData[]>([]);
    const router = useRouter();
    
    useEffect(() => {
        const loadMarker = async () => {
          const markers = await getMarkers();
          const foundMarker = markers.find(m => m.id === id);
          if (foundMarker) {
            setMarker(foundMarker);
            const allImages = await getMarkerImages(foundMarker.id);
            setImages(allImages);
          } else {
            router.back();
          }
        };
        loadMarker();
      }, [id]);

    const addImage = async () => {
        try {
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if(!pickerResult.canceled){
                await plusImage(marker.id, pickerResult.assets[0].uri);    
                const updatedImages = await getMarkerImages(id);
                setImages(updatedImages);
            }
        }catch(error){
            console.error("Ошибка выбора изображения: ", error);
            Alert.alert("Ошибка", "Ошибка выбора изображения")
        }
    };
    
    const deleteImage = async (imageId: string) => {
        await minusImage(imageId);
        const updatedImages = await getMarkerImages(id);
        setImages(updatedImages);
    };

    const deleteMarker = async () => {
        await minusMarker(id);
        router.back();
    };

    return(
        <View style={{flex: 1, alignContent: 'center', padding: 10}}>
            <View style={{ padding: 10, backgroundColor: '#fff' }}>
                <Text>id: {marker.id}</Text>
                <Text>latitude: {marker.latitude}</Text>
                <Text>longitude: {marker.longitude}</Text>
            </View>
            <View style={{flex:1}}>
                <ImageList images={images} deleteImage={deleteImage}/>
            </View>
            <View style={{ padding: 10, margin: 10, backgroundColor: '#fff', flexDirection:'row', gap: '15%' }}>
                <Button 
                    title='add image'
                    color="#FF3B30"
                    onPress={addImage}
                />
                <Button
                    title='delete marker'
                    color="#FF3B30"
                    onPress={deleteMarker}
                />
                <Button 
                    title='back' 
                    onPress={() => router.back()}
                />
            </View>
        </View>
    );
}