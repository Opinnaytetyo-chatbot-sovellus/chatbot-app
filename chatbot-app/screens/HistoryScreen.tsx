import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Platform, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

function getApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';
}

const apiBaseUrl = getApiBaseUrl();

type HistoryItem = {
  id: string;
  created_at?: string;
};

type HistoryScreenProps = {
  userId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

const HistoryScreen = ({ userId, onSelectConversation }: HistoryScreenProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setIsLoading(true);

    if (!userId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    fetch(`${apiBaseUrl}/chat/history?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Viestihistorian lataaminen epäonnistui.');
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const title = `Keskustelu ${index + 1}`;
    const dateText = item.created_at ? new Date(item.created_at).toLocaleString('fi-FI') : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onSelectConversation(item.id)}
      >
        <Text style={styles.itemText}>{title}</Text>
        {dateText ? <Text style={styles.subText}>{dateText}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viestihistoria</Text>
      {isLoading ? (
        <Text style={styles.message}>Ladataan historiaa...</Text>
      ) : error ? (
        <Text style={[styles.message, styles.errorText]}>{error}</Text>
      ) : !userId ? (
        <Text style={styles.message}>Kirjaudu sisään nähdäksesi oman historian.</Text>
      ) : history.length === 0 ? (
        <Text style={styles.message}>Ei viestejä nähtävillä.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // määrittele tyylit
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  itemText: { fontSize: 16 },
  subText: { fontSize: 12, color: '#666', marginTop: 4 },
  message: { fontSize: 16, color: '#555', paddingTop: 12 },
  errorText: { color: '#d00' },
});

export default HistoryScreen;
