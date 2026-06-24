import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getApiUrl } from '../api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'error';
};

type ChatScreenProps = {
  conversationId: string | null;
  currentUserId: string | null;
  onStartNewConversation: () => void;
};

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function ChatScreen({
  conversationId: selectedConversationId,
  currentUserId,
  onStartNewConversation,
}: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(selectedConversationId);
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    fetch(getApiUrl(`/chat/messages/${selectedConversationId}`))
      .then((res) => res.json())
      .then((data) => {
        setConversationId(selectedConversationId);

        if (Array.isArray(data)) {
          setMessages(
            data.map((item: any) => ({
              id: `${item.role}-${Math.random().toString(36).slice(2)}`,
              role: item.role,
              content: item.content,
            }))
          );
        }
      })
      .catch((error) => {
        console.error('Failed to load conversation messages:', error);
      });
  }, [selectedConversationId]);

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setMessage('');
    onStartNewConversation();
  };

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || isSending) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setMessage('');
    setIsSending(true);

    try {
      const response = await fetch(getApiUrl('/chat/message'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(conversationId ? { conversationId } : {}),
          ...(currentUserId ? { userId: currentUserId } : {}),
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Pyyntö epäonnistui');
      }

      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: data.reply || 'Vastausta ei saatu.',
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: 'Botti ei vastannut. Tarkista, että backend on käynnissä ja OPENAI_API_KEY on asetettu.',
          status: 'error',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              msg.status === 'error' && styles.errorBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.role === 'user' && styles.userMessageText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}
        {isSending && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.messageText}>Botti vastaa...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Kirjoita viesti..."
          editable={!isSending}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || isSending}
        >
          <Text style={styles.sendText}>{isSending ? '...' : 'Lähetä'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
        <Text style={styles.newConversationText}>Aloita uusi keskustelu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  errorBubble: {
    backgroundColor: '#ffe7e7',
  },
  messageText: {
    color: '#222',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#9bbfe8',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newConversationButton: {
    margin: 12,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newConversationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
