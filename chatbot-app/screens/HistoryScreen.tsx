import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiBaseUrl } from '../api';

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
    let isMounted = true;

    const loadHistory = async () => {
      setError(null);
      setIsLoading(true);

      if (!userId) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/chat/history?userId=${encodeURIComponent(userId)}`);

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();

        if (!isMounted) {
          return;
        }

        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error(err);
        setError('Viestihistorian lataaminen epäonnistui.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
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
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 18,
  },
  item: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#d8dee8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subText: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
  },
  message: {
    fontSize: 16,
    color: '#555f6d',
    paddingTop: 12,
  },
  errorText: {
    color: '#b42318',
  },
});

export default HistoryScreen;
