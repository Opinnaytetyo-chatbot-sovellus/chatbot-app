import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";

type LoginScreenProps = {
  onLogin: (user: { id: string; email: string }) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitUser = async (createNew: boolean) => {
    if (!email) {
      return Alert.alert('Virhe', 'Anna sähköpostiosoite.');
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, createNew }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Palvelin palautti ei-JSON-vastauksen: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || (createNew ? 'Käyttäjän luonti epäonnistui.' : 'Kirjautuminen epäonnistui.'));
      }

      onLogin({ id: data.userId, email });
      Alert.alert('Onnistui', createNew ? `Uusi käyttäjä luotu: ${email}` : `Kirjautunut: ${email}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Palvelinvirhe.';
      Alert.alert('Virhe', message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Kirjaudu sisään</Text>

      <TextInput
        placeholder="Sähköposti"
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Salasana"
        secureTextEntry
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginTop: 16 }}>
        <Button title="Kirjaudu sisään" onPress={() => submitUser(false)} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Button title="Uusi käyttäjä" onPress={() => submitUser(true)} />
      </View>
    </View>
  );
}