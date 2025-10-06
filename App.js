import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://ton-backend.onrender.com/api'; // remplace par ton backend

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'TON_CLIENT_ID_EXPO',
    iosClientId: 'TON_CLIENT_ID_IOS',
    androidClientId: 'TON_CLIENT_ID_ANDROID',
    webClientId: 'TON_CLIENT_ID_WEB',
  });

  // Face ID
  const authenticate = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Connectez-vous avec Face ID',
      fallbackLabel: 'Mot de passe'
    });

    return result.success;
  };

  // Récupérer token au lancement
  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        const success = await authenticate();
        if (success) {
          setToken(storedToken);
          Alert.alert('Connexion réussie via Face ID !');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Google Sign-In automatique
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      googleLogin(authentication.accessToken);
    }
  }, [response]);

  // Fonction login/register classique
  const handleAuth = async () => {
    try {
      setLoading(true);
      if (isRegister) {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        await AsyncStorage.setItem('userToken', res.data.token);
        setToken(res.data.token);
        Alert.alert('Compte créé ✅');
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        await AsyncStorage.setItem('userToken', res.data.token);
        setToken(res.data.token);
        Alert.alert('Connexion réussie ✅');
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction login via Google
  const googleLogin = async (accessToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { accessToken });
      await AsyncStorage.setItem('userToken', res.data.token);
      setToken(res.data.token);
      Alert.alert('Connecté avec Google ✅');
    } catch (err) {
      Alert.alert('Erreur Google', err.response?.data || 'Erreur serveur');
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
    Alert.alert('Déconnecté ✅');
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (token) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Bienvenue ! Vous êtes connecté.</Text>
        <Button title="Se déconnecter" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      {isRegister && (
        <TextInput placeholder="Nom" value={name} onChangeText={setName} style={{ marginBottom: 10 }} />
      )}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 10 }} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 10 }} />
      <Button title={isRegister ? "Créer un compte" : "Se connecter"} onPress={handleAuth} />
      <Button title={isRegister ? "J'ai déjà un compte" : "Je veux créer un compte"} onPress={() => setIsRegister(!isRegister)} />
      <View style={{ marginTop: 20 }}>
        <Button title="Se connecter avec Google" disabled={!request} onPress={() => promptAsync()} />
      </View>
    </View>
  );
}
{
  "expo": {
    "name": "TonApp",
    "slug": "ton-app-slug",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.tonnomutilisateur.tonapp",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.tonnomutilisateur.tonapp",
      "versionCode": 1
    },
    "extra": {
      "googleClientId": "TON_CLIENT_ID_IOS",
      "googleClientIdWeb": "TON_CLIENT_ID_WEB"
    }
  }
}