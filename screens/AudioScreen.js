import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const AudioScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão para acessar o microfone é necessária!');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      console.log('Iniciando gravação...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync(); 
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar a gravação:', err);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Parando gravação...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      console.log('Gravação armazenada em:', uri);

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio_recording.m4a',
        type: 'audio/m4a',
      });

      axios.post('https://seu-backend.com/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        Alert.alert('Sucesso', 'Áudio enviado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao enviar o áudio:', error);
        Alert.alert('Erro', 'Não foi possível enviar o áudio.');
      });

    } catch (error) {
      console.error('Erro ao parar a gravação:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captura de Áudio</Text>
      <TouchableOpacity
        style={isRecording ? styles.stopButton : styles.recordButton}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{isRecording ? 'Parar' : 'Gravar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFFF', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: '#000080', 
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: '#FF0000',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    width: 150,
  },
  stopButton: {
    backgroundColor: '#808080',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    width: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AudioScreen;
