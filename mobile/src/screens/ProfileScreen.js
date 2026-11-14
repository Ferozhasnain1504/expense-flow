
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

export default function ProfileScreen({ navigation }) {
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
          onPress: () => {
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>My Profile</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>

        <Text style={styles.name}>ExpenseFlow User</Text>
        <Text style={styles.email}>Account details coming soon</Text>
        <Text style={styles.accountBadge}>Demo Account</Text>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>

      <View style={styles.menuCard}>
        <MenuItem icon="👤" title="Personal Information" />
        <MenuItem icon="🔒" title="Security" />
        <MenuItem icon="🔔" title="Notifications" />
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>

      <View style={styles.menuCard}>
        <MenuItem icon="🎨" title="Appearance" />
        <MenuItem icon="💰" title="Currency: INR (₹)" />
        <MenuItem icon="❓" title="Help & Support" />
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.version}>ExpenseFlow · Version 1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, title }) {
  return (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    padding: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 45,
  },
  subtitle: {
    color: '#9298AA',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 25,
  },
  profileCard: {
    backgroundColor: '#191F35',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#8B5CF6',
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
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    color: '#9298AA',
    fontSize: 13,
    marginTop: 6,
  },
  accountBadge: {
    color: '#C4B5FD',
    backgroundColor: '#302650',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    fontSize: 11,
    marginTop: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#191F35',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#303750',
  },
  menuIcon: {
    fontSize: 19,
    marginRight: 13,
  },
  menuTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    flex: 1,
  },
  arrow: {
    color: '#9298AA',
    fontSize: 24,
  },
  logoutButton: {
    backgroundColor: '#351D2A',
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 5,
  },
  logoutText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    color: '#626B80',
    textAlign: 'center',
    fontSize: 11,
    marginVertical: 25,
  },
});
