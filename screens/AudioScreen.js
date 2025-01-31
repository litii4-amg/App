import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

const BACKEND_GENERATE_URL = 'http://35.202.139.94:3000/upload-audio';

const AudioScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);  
  const [capturedAudio, setCapturedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar a gravação:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
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
      setCapturedAudio(uri);
    } catch (error) {
      console.error('Erro ao parar a gravação:', error);
      Alert.alert('Erro', 'Não foi possível parar a gravação.');
    }
  };

  const approveAudio = async () => {
    try {
      if (!capturedAudio) {
        Alert.alert('Erro', 'Nenhum áudio gravado para enviar.');
        return;
      }

      setUploading(true);

      const fileUri = capturedAudio;
      const fileName = fileUri.split('/').pop();

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName || 'audio_recording.m4a', 
        type: 'audio/m4a',
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

      Alert.alert('Sucesso', 'Áudio enviado com sucesso!');
      setCapturedAudio(null);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao enviar o áudio:', error);
      Alert.alert('Erro', 'Não foi possível enviar o áudio.');
    } finally {
      setUploading(false);
    }
  };

  const rejectAudio = () => {
    console.log('Áudio rejeitado');
    setCapturedAudio(null);

    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const handleBack = () => {
    console.log('Voltando para a Home');
    setCapturedAudio(null);

    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
    navigation.navigate('Home');
  };

  const handlePlayAudio = async () => {
    try {
      if (sound && isPlaying) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      if (sound && !isPlaying) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (capturedAudio) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: capturedAudio },
          { shouldPlay: true } 
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            newSound.unloadAsync();
            setIsPlaying(false);
            setSound(null);
          }
        });
      }
    } catch (err) {
      console.error('Erro ao reproduzir o áudio:', err);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
    }
  };

  return (
    <View style={styles.container}>
      {capturedAudio ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Áudio Gravado!</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={approveAudio}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={rejectAudio}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>Reprovar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.listenButton}
            onPress={handlePlayAudio}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? 'Parar' : 'Ouvir'}
            </Text>
          </TouchableOpacity>

          {uploading && <ActivityIndicator size="large" color="#0000ff" />}

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.recordContainer}>
          <Text style={styles.title}>Captura de Áudio</Text>
          <TouchableOpacity
            style={isRecording ? styles.stopButton : styles.recordButton}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Parar' : 'Gravar'}
            </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  previewText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#000080',
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

  listenButton: {
    backgroundColor: '#87CEFA',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AudioScreen;
