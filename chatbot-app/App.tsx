import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<'chat' | 'login'>('chat');

  const renderScreen = () => {
    if (screen === 'login') return <LoginScreen />;
    return <ChatScreen />;
  };

  return (
    <View style={styles.container}>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.burger}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Chatbot</Text>
      </View>

      <View style={styles.body}>
        {renderScreen()}
      </View>

      {/* SIDE MENU */}
      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setScreen('chat');
              setMenuOpen(false);
            }}
          >
            <Text>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setScreen('login');
              setMenuOpen(false);
            }}
          >
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  burger: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});