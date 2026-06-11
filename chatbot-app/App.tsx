import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import HistoryScreen from './screens/HistoryScreen';

type CurrentUser = {
  id: string;
  email: string;
} | null;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<'chat' | 'login' | 'history'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  const renderScreen = () => {
    if (screen === 'login') {
      return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
    }

    if (screen === 'history') {
      return (
        <HistoryScreen
          userId={currentUser?.id ?? null}
          onSelectConversation={(conversationId) => {
            setSelectedConversationId(conversationId);
            setScreen('chat');
          }}
        />
      );
    }

    return <ChatScreen conversationId={selectedConversationId} currentUserId={currentUser?.id ?? null} />;
  };

  return (
    <View style={styles.container}>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.burger}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>My Chatbot</Text>
        </View>

        <Text style={styles.userLabel}>
          {currentUser ? `Kirjautunut: ${currentUser.email}` : 'Ei kirjautunut'}
        </Text>
      </View>

      <View style={styles.body}>
        {renderScreen()}
      </View>

      {/* SIDE MENU */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity style={styles.closeButtonWrapper} onPress={() => setMenuOpen(false)}>
                <Text style={styles.closeButton}>←</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.menuItem, screen === 'chat' && styles.activeMenuItem]}
              onPress={() => {
                setScreen('chat');
                setMenuOpen(false);
              }}
            >
              <Text style={[styles.menuItemText, screen === 'chat' && styles.activeMenuItemText]}>Keskustelu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, screen === 'login' && styles.activeMenuItem]}
              onPress={() => {
                setScreen('login');
                setMenuOpen(false);
              }}
            >
              <Text style={[styles.menuItemText, screen === 'login' && styles.activeMenuItemText]}>Kirjaudu sisään</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, screen === 'history' && styles.activeMenuItem]}
              onPress={() => {
                setScreen('history');
                setMenuOpen(false);
              }}
            >
              <Text style={[styles.menuItemText, screen === 'history' && styles.activeMenuItemText]}>
                Viestihistoria
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.overlayBackdrop} onPress={() => setMenuOpen(false)} />
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
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    width: 260,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 24,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButtonWrapper: {
    padding: 10,
    marginTop: 4,
  },
  closeButton: {
    fontSize: 24,
    color: '#444',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  userLabel: {
    fontSize: 12,
    color: '#555',
  },
  activeMenuItem: {
    backgroundColor: '#f2f8ff',
  },
  activeMenuItemText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});