import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import LoginScreen from './screens/LoginScreen';

type CurrentUser = {
  id: string;
  email: string;
} | null;

type ScreenName = 'chat' | 'login' | 'history';

const menuItems: { label: string; screen: ScreenName }[] = [
  { label: 'Keskustelu', screen: 'chat' },
  { label: 'Kirjaudu sisään', screen: 'login' },
  { label: 'Viestihistoria', screen: 'history' },
];

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 860;
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  const navigateTo = (nextScreen: ScreenName) => {
    setScreen(nextScreen);
    setMenuOpen(false);
  };

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
            setMenuOpen(false);
          }}
        />
      );
    }

    return (
      <ChatScreen
        conversationId={selectedConversationId}
        currentUserId={currentUser?.id ?? null}
        onStartNewConversation={() => setSelectedConversationId(null)}
      />
    );
  };

  const renderMenu = () => (
    <View style={[styles.menu, isWide && styles.menuWide]}>
      <View style={styles.menuHeader}>
        <View>
          <Text style={styles.menuTitle}>Chatbotti</Text>
          <Text style={styles.menuSubtitle}>
            {currentUser ? currentUser.email : 'Ei kirjautunut'}
          </Text>
        </View>
        {!isWide && (
          <TouchableOpacity
            accessibilityLabel="Sulje valikko"
            style={styles.closeButtonWrapper}
            onPress={() => setMenuOpen(false)}
          >
            <Text style={styles.closeButton}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menuItems}>
        {menuItems.map((item) => {
          const isActive = screen === item.screen;

          return (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuItem, isActive && styles.activeMenuItem]}
              onPress={() => navigateTo(item.screen)}
            >
              <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isWide && styles.containerWide]}>
      {isWide && renderMenu()}

      <View style={styles.main}>
        {!isWide && (
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityLabel="Avaa valikko"
              style={styles.burgerButton}
              onPress={() => setMenuOpen(true)}
            >
              <Text style={styles.burger}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Chatbotti</Text>

            <Text style={styles.userLabel} numberOfLines={1}>
              {currentUser ? currentUser.email : 'Ei kirjautunut'}
            </Text>
          </View>
        )}

        <View style={[styles.body, isWide && styles.bodyWide]}>
          <View style={[styles.contentShell, isWide && styles.contentShellWide]}>
            {renderScreen()}
          </View>
        </View>
      </View>

      {!isWide && menuOpen && (
        <View style={styles.menuOverlay}>
          {renderMenu()}
          <Pressable style={styles.overlayBackdrop} onPress={() => setMenuOpen(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  containerWide: {
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#d8dee8',
  },
  burgerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burger: {
    fontSize: 24,
    color: '#1f2937',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  userLabel: {
    maxWidth: 140,
    fontSize: 12,
    color: '#5b6472',
    textAlign: 'right',
  },
  body: {
    flex: 1,
  },
  bodyWide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  contentShell: {
    flex: 1,
  },
  contentShellWide: {
    width: '100%',
    maxWidth: 980,
    borderWidth: 1,
    borderColor: '#d8dee8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
  },
  menu: {
    width: 270,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#d8dee8',
    paddingTop: 24,
  },
  menuWide: {
    paddingTop: 36,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  menuSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  closeButtonWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    fontSize: 24,
    color: '#374151',
  },
  menuItems: {
    padding: 10,
    gap: 4,
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
  },
  activeMenuItem: {
    backgroundColor: '#e8f1ff',
  },
  activeMenuItemText: {
    color: '#1457b7',
    fontWeight: '700',
  },
});
