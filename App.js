import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [transactions, setTransactions] = useState([]);

  // ✅ URL du backend déjà mise
  const API_URL = 'https://fcc-backend.onrender.com/api';

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      Alert.alert('Login réussi', `Bienvenue ${res.data.user.name}`);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data || 'Impossible de se connecter');
    }
  };

  const sendCredit = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/transaction/send`,
        { receiverPhone, amount: Number(amount) },
        { headers: { 'x-auth-token': token } }
      );
      setTransactions([res.data.transaction, ...transactions]);
      Alert.alert('Succès', 'Crédit envoyé !');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data || 'Impossible d’envoyer le crédit');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FCC - Crédit France-Comores</Text>

      {!token && (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button title="Se connecter" onPress={login} />
        </>
      )}

      {token && (
        <>
          <TextInput
            placeholder="Numéro destinataire"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            style={styles.input}
          />
          <TextInput
            placeholder="Montant"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Envoyer le crédit" onPress={sendCredit} />

          <Text style={styles.subtitle}>Historique des transactions :</Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Text>
                Envoyé {item.amount} à {item.receiver}
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
});