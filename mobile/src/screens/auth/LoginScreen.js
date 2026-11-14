
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Invalid password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    // Temporary frontend-only login.
    // Real JWT authentication will be implemented with the backend.

    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND */}

        <View style={styles.brandContainer}>
          <View
            style={[
              styles.logo,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.logoText}>₹</Text>
          </View>

          <Text style={[styles.brandName, { color: colors.text }]}>
            ExpenseFlow
          </Text>

          <Text style={[styles.brandTagline, { color: colors.secondaryText }]}>
            Take control of your money.
          </Text>
        </View>

        {/* WELCOME */}

        <View style={styles.headingContainer}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Welcome Back!
          </Text>

          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Sign in to continue managing your finances.
          </Text>
        </View>

        {/* EMAIL */}

        <Text style={[styles.label, { color: colors.text }]}>
          Email Address
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.inputIcon}>✉</Text>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter your email"
            placeholderTextColor={colors.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* PASSWORD */}

        <Text style={[styles.label, { color: colors.text }]}>
          Password
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.inputIcon}>🔒</Text>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter your password"
            placeholderTextColor={colors.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={[styles.showPassword, { color: colors.primary }]}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>

        {/* FORGOT PASSWORD */}

        <Pressable
          style={styles.forgotContainer}
          onPress={() =>
            Alert.alert(
              'Forgot Password',
              'Password recovery will be implemented with backend authentication.'
            )
          }
        >
          <Text style={[styles.forgotText, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </Pressable>

        {/* LOGIN BUTTON */}

        <Pressable
          style={[
            styles.loginButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            Sign In →
          </Text>
        </Pressable>

        {/* REGISTER */}

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.secondaryText }]}>
            Don't have an account?
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              {' '}Create Account
            </Text>
          </Pressable>
        </View>

        {/* FOOTER */}

        <Text style={[styles.footer, { color: colors.secondaryText }]}>
          YOUR FINANCES. YOUR CONTROL.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 65,
    paddingBottom: 35,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },

  logo: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  brandName: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  brandTagline: {
    fontSize: 13,
    marginTop: 7,
  },

  headingContainer: {
    marginBottom: 30,
  },

  heading: {
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 9,
    lineHeight: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
  },

  inputContainer: {
    height: 58,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 14,
  },

  showPassword: {
    fontSize: 12,
    fontWeight: '700',
    paddingLeft: 8,
  },

  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: 15,
  },

  forgotText: {
    fontSize: 12,
    fontWeight: '700',
  },

  loginButton: {
    height: 58,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },

  registerText: {
    fontSize: 13,
  },

  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 55,
  },
});
