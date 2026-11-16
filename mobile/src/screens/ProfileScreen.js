
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  logoutUser,
  getCurrentUser,
} from '../services/authService';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log(
          'Profile loading error:',
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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
              await logoutUser();

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

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              YOUR ACCOUNT
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>
              Profile
            </Text>

            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Manage your account and preferences
            </Text>
          </View>

          <View
            style={[
              styles.headerIcon,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={{ fontSize: 21 }}>⚙️</Text>
          </View>
        </View>

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
          <View style={styles.profileTop}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            <View style={styles.profileInfo}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text
                    style={[styles.name, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {user?.name || 'User'}
                  </Text>

                  <Text
                    style={[
                      styles.email,
                      { color: colors.secondaryText },
                    ]}
                    numberOfLines={2}
                  >
                    {user?.email || 'Email unavailable'}
                  </Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.verifiedIcon,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={{ fontSize: 16 }}>✓</Text>
            </View>
          </View>

          <View
            style={[
              styles.profileDivider,
              { backgroundColor: colors.border },
            ]}
          />

          <View style={styles.accountFooter}>
            <View style={styles.accountStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: '#22C55E' },
                ]}
              />

              <Text
                style={[
                  styles.accountStatusText,
                  { color: colors.secondaryText },
                ]}
              >
                Account active
              </Text>
            </View>

            <Text style={[styles.accountType, { color: colors.primary }]}>
              EXPENSEFLOW
            </Text>
          </View>
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" colors={colors} />

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <MenuItem
            icon="👤"
            title="Personal Information"
            subtitle="Your profile details"
            colors={colors}
          />

          <MenuItem
            icon="🔒"
            title="Security"
            subtitle="Account security settings"
            colors={colors}
          />

          <MenuItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage bill reminders"
            colors={colors}
            isLast
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" colors={colors} />

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: colors.border },
            ]}
            onPress={toggleTheme}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={styles.menuIcon}>🎨</Text>
            </View>

            <View style={styles.menuInfo}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                Appearance
              </Text>

              <Text
                style={[
                  styles.menuSubtitle,
                  { color: colors.secondaryText },
                ]}
              >
                Customize your app theme
              </Text>
            </View>

            <View
              style={[
                styles.valueBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.valueText, { color: colors.primary }]}>
                {isDark ? 'Dark' : 'Light'}
              </Text>
            </View>

            <Text style={[styles.arrow, { color: colors.secondaryText }]}>
              ›
            </Text>
          </Pressable>

          <MenuItem
            icon="💰"
            title="Currency"
            subtitle="Indian Rupee (₹)"
            colors={colors}
          />

          <MenuItem
            icon="❓"
            title="Help & Support"
            subtitle="Get assistance"
            colors={colors}
            isLast
          />
        </View>

        {/* App Information */}
        <View
          style={[
            styles.appCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.appLogo,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={{ fontSize: 25 }}>💸</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.appName, { color: colors.text }]}>
              ExpenseFlow
            </Text>

            <Text
              style={[
                styles.appDescription,
                { color: colors.secondaryText },
              ]}
            >
              Take control of your money.
            </Text>
          </View>

          <Text style={[styles.versionBadge, { color: colors.primary }]}>
            v1.0.0
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: isDark ? '#351D2A' : '#FEE2E2',
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>↪</Text>

          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Log Out
          </Text>
        </Pressable>

        <Text style={[styles.footer, { color: colors.secondaryText }]}>
          Made with care for better financial habits
        </Text>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, colors }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  colors,
  isLast = false,
}) {
  return (
    <View
      style={[
        styles.menuItem,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: colors.surface },
        ]}
      >
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>

      <View style={styles.menuInfo}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>
          {title}
        </Text>

        <Text
          style={[
            styles.menuSubtitle,
            { color: colors.secondaryText },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.arrow, { color: colors.secondaryText }]}>
        ›
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 7,
  },

  heading: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 30,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 19,
    fontWeight: '800',
  },

  email: {
    fontSize: 12,
    marginTop: 5,
  },

  verifiedIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileDivider: {
    height: 1,
    marginVertical: 19,
  },

  accountFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  accountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  accountStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  accountType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  menuCard: {
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginBottom: 27,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },

  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  menuIcon: {
    fontSize: 18,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  menuSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },

  valueBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    marginRight: 8,
  },

  valueText: {
    fontSize: 11,
    fontWeight: '700',
  },

  arrow: {
    fontSize: 23,
    fontWeight: '300',
  },

  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 20,
  },

  appLogo: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  appName: {
    fontSize: 14,
    fontWeight: '800',
  },

  appDescription: {
    fontSize: 11,
    marginTop: 4,
  },

  versionBadge: {
    fontSize: 10,
    fontWeight: '700',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
  },

  logoutIcon: {
    fontSize: 19,
    marginRight: 9,
    color: '#DC2626',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 23,
  },
});
