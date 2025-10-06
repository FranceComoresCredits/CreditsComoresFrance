import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Google from 'expo-auth-session/providers/google';

const API_URL = 'https://ton-backend.onrender.com/api'; // remplace par ton backend

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [token, setToken] = useState(null);

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

  useEffect(() => {
    // Face ID automatique
    const checkFaceID = async () => {
      const success = await authenticate();
      if (success && token) {
        Alert.alert('Connexion réussie via Face ID !');
      }
    };
    checkFaceID();

    // Google Sign-In automatique
    if (response?.type === 'success') {
      const { authentication } = response;
      googleLogin(authentication.accessToken);
    }
  }, [response]);

  // Fonction pour login/register classique
  const handleAuth = async () => {
    try {
      if (isRegister) {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        setToken(res.data.token);
        Alert.alert('Compte créé ✅');
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        setToken(res.data.token);
        Alert.alert('Connexion réussie ✅');
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data || 'Erreur serveur');
    }
  };

  // Fonction pour login via Google
  const googleLogin = async (accessToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { accessToken });
      setToken(res.data.token);
      Alert.alert('Connecté avec Google ✅');
    } catch (err) {
      Alert.alert('Erreur Google', err.response?.data || 'Erreur serveur');
    }
  };

  if (token) {
    // Interface principale après connexion
    return (
      <View style={{ padding: 20 }}>
        <Text>Bienvenue ! Vous êtes connecté.</Text>
        {/* Ici tu peux ajouter envoi crédit, historique, etc. */}
      </View>
    );
  }

  // Formulaire login/register
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