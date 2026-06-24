import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiBaseUrl } from '../api';

type LoginScreenProps = {
  onLogin: (user: { id: string; email: string }) => void;
};

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
    return;
  }

  Alert.alert(title, message);
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitUser = async (createNew: boolean) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showMessage('Virhe', 'Anna sähköpostiosoite.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, createNew }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
          (createNew ? 'Käyttäjän luonti epäonnistui.' : 'Kirjautuminen epäonnistui.')
        );
      }

      onLogin({ id: data.userId, email: trimmedEmail });
      showMessage(
        'Onnistui',
        createNew ? `Uusi käyttäjä luotu: ${trimmedEmail}` : `Kirjautunut: ${trimmedEmail}`
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Palvelinvirhe.';
      showMessage('Virhe', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Kirjaudu sisään</Text>

        <TextInput
          placeholder="Sähköposti"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />

        <TextInput
          placeholder="Salasana"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!isSubmitting}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={() => submitUser(false)}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>Kirjaudu sisään</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isSubmitting && styles.disabledButton]}
            onPress={() => submitUser(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>Uusi käyttäjä</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1457b7',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b9c6d8',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.62,
  },
});
