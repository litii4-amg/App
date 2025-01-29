import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import AudioScreen from './screens/AudioScreen';
import CameraScreen from './screens/CameraScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#ADD8E6' }, 
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
        <Stack.Screen name="Audio" component={AudioScreen} options={{ title: 'Captura de Áudio' }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Captura de Imagem' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
