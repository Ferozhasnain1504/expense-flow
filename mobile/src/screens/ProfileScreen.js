
import React from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../services/authService';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the saved JWT token
              await logoutUser();

              // Navigate to Login and reset navigation history
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Logout error:', error.message);

              Alert.alert(
                'Logout failed',
                'Could not log you out. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        My Profile
      </Text>

      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
        Manage your account
      </Text>

      {/* Profile Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.avatarText}>U</Text>
        </View>

        <Text style={[styles.name, { color: colors.text }]}>
          ExpenseFlow User
        </Text>

        <Text style={[styles.email, { color: colors.secondaryText }]}>
          Account details coming soon
        </Text>

        <Text
          style={[
            styles.accountBadge,
            {
              color: colors.primary,
              backgroundColor: colors.surface,
            },
          ]}
        >
          Demo Account
        </Text>
      </View>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Account
      </Text>

      <View
        style={[
          styles.menuCard,
          { backgroundColor: colors.card },
        ]}
      >
        <MenuItem
          icon="👤"
          title="Personal Information"
          colors={colors}
        />

        <MenuItem
          icon="🔒"
          title="Security"
          colors={colors}
        />

        <MenuItem
          icon="🔔"
          title="Notifications"
          colors={colors}
          isLast
        />
      </View>

      {/* Preferences Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Preferences
      </Text>

      <View
        style={[
          styles.menuCard,
          { backgroundColor: colors.card },
        ]}
      >
        <Pressable
          style={[
            styles.menuItem,
            { borderBottomColor: colors.border },
          ]}
          onPress={toggleTheme}
        >
          <Text style={styles.menuIcon}>🎨</Text>

          <Text style={[styles.menuTitle, { color: colors.text }]}>
            Appearance
          </Text>

          <Text style={[styles.themeValue, { color: colors.primary }]}>
            {isDark ? 'Dark' : 'Light'}
          </Text>

          <Text style={[styles.arrow, { color: colors.secondaryText }]}>
            ›
          </Text>
        </Pressable>

        <MenuItem
          icon="💰"
          title="Currency: INR (₹)"
          colors={colors}
        />

        <MenuItem
          icon="❓"
          title="Help & Support"
          colors={colors}
          isLast
        />
      </View>

      {/* Logout */}
      <Pressable
        style={[
          styles.logoutButton,
          {
            backgroundColor: theme.mode === 'dark'
              ? '#351D2A'
              : '#FEE2E2',
          },
        ]}
        onPress={handleLogout}
      >
        <Text
          style={[
            styles.logoutText,
            { color: colors.danger },
          ]}
        >
          Logout
        </Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.secondaryText }]}>
        ExpenseFlow · Version 1.0.0
      </Text>
    </ScrollView>
  );
}

function MenuItem({ icon, title, colors, isLast = false }) {
  return (
    <Pressable
      style={[
        styles.menuItem,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>

      <Text style={[styles.menuTitle, { color: colors.text }]}>
        {title}
      </Text>

      <Text style={[styles.arrow, { color: colors.secondaryText }]}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 45,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 25,
  },

  profileCard: {
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
  },

  email: {
    fontSize: 13,
    marginTop: 6,
  },

  accountBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    fontSize: 11,
    marginTop: 14,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },

  menuCard: {
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    borderBottomWidth: 1,
  },

  menuIcon: {
    fontSize: 19,
    marginRight: 13,
  },

  menuTitle: {
    fontSize: 14,
    flex: 1,
  },

  arrow: {
    fontSize: 24,
  },

  themeValue: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },

  logoutButton: {
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 5,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },

  version: {
    textAlign: 'center',
    fontSize: 11,
    marginVertical: 25,
  },
});
