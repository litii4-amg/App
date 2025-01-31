import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_GENERATE_URL = 'http://35.202.139.94:3000/upload-image'; 

const CameraScreen = ({ navigation }) => {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Status da permissão da câmera:', status);
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão para acessar a câmera é necessária!');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: false,
        quality: 1,
      });

      console.log('Resultado do ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Foto capturada:', result.assets[0].uri);
        setCapturedPhoto(result.assets[0].uri);
      } else {
        console.log('Captura de foto cancelada');
      }
    } catch (error) {
      console.error('Erro ao capturar a foto:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar capturar a foto.');
    }
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Status da permissão da galeria:', status);
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão para acessar a galeria é necessária!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: false,
        quality: 1,
      });

      console.log('Resultado do ImagePicker (Galeria):', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Foto selecionada:', result.assets[0].uri);
        setCapturedPhoto(result.assets[0].uri);
      } else {
        console.log('Seleção de foto cancelada');
      }
    } catch (error) {
      console.error('Erro ao selecionar a foto da galeria:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar selecionar a foto.');
    }
  };

  const approvePhoto = async () => {
    try {
      if (!capturedPhoto) {
        Alert.alert('Erro', 'Nenhuma foto capturada para enviar.');
        return;
      }
  
      setUploading(true);

      const fileUri = capturedPhoto;
      const fileName = fileUri.split('/').pop();
  
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',  
        name: fileName,
      });
  
      const response = await fetch(BACKEND_GENERATE_URL, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no upload: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log('Upload realizado com sucesso! Resposta do servidor:', result);
  
      Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
      setCapturedPhoto(null);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };  

  const rejectPhoto = () => {
    console.log('Foto rejeitada');
    setCapturedPhoto(null);
    takePicture(); 
  };

  const handleBack = () => {
    console.log('Voltando para a Home');
    setCapturedPhoto(null);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.approveButton} onPress={approvePhoto} disabled={uploading}>
              <Text style={styles.buttonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={rejectPhoto} disabled={uploading}>
              <Text style={styles.buttonText}>Reprovar</Text>
            </TouchableOpacity>
          </View>
          {uploading && <ActivityIndicator size="large" color="#0000ff" />}
          <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={uploading}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.captureContainer}>
          <Text style={styles.instructionText}>Pressione o botão para tirar uma foto</Text>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.buttonText}>Capturar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={selectFromGallery}>
            <Text style={styles.buttonText}>Selecionar da Galeria</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  captureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#000080', 
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#87CEFA', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
    marginVertical: 10,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  approveButton: {
    backgroundColor: '#32CD32', 
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    width: 120,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF0000', 
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    width: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#808080',
    padding: 15,
    borderRadius: 10,
    width: 120,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CameraScreen;
