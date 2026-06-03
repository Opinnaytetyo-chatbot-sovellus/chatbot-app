import React from "react";
import { View, Text, TextInput, Button } from "react-native";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Kirjaudu sisään</Text>

      <TextInput
        placeholder="Sähköposti"
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Salasana"
        secureTextEntry
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />

      <Button title="Login" onPress={() => {}} />
    </View>
  );
}