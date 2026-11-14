
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
  ActivityIndicator,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { registerUser } from '../../services/authService';
import { useExpenses } from '../../context/ExpenseContext';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { refreshExpenses } = useExpenses();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Weak password',
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Your passwords do not match.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.success) {
        try {
          await refreshExpenses();
        } catch (expenseError) {
          console.log('Expense loading error:', expenseError.message);
        }

        Alert.alert(
          'Registration successful',
          `Welcome to ExpenseFlow, ${response.user.name}!`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('MainTabs'),
            },
          ]
        );
      }
    } catch (error) {
      console.log(
        'Registration error:',
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        'Unable to connect to the server. Please try again.';

      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
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
        {/* BACK BUTTON */}

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← Back
          </Text>
        </Pressable>

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
            Start your financial journey.
          </Text>
        </View>

        {/* HEADING */}

        <View style={styles.headingContainer}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Create Account
          </Text>

          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Join us and take control of your finances.
          </Text>
        </View>

        {/* FULL NAME */}

        <Text style={[styles.label, { color: colors.text }]}>
          Full Name
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
          <Text style={styles.inputIcon}>👤</Text>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={60}
          />
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
            placeholder="Create a password"
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

        {/* CONFIRM PASSWORD */}

        <Text style={[styles.label, { color: colors.text }]}>
          Confirm Password
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
          <Text style={styles.inputIcon}>🔐</Text>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Confirm your password"
            placeholderTextColor={colors.secondaryText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />

          <Pressable
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Text style={[styles.showPassword, { color: colors.primary }]}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>

        {/* PASSWORD HINT */}

        <Text style={[styles.passwordHint, { color: colors.secondaryText }]}>
          Use at least 8 characters for your password.
        </Text>

        {/* REGISTER BUTTON */}

        <Pressable
          style={[
            styles.registerButton,
            {
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              Create Account →
            </Text>
          )}
        </Pressable>

        {/* LOGIN LINK */}

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.secondaryText }]}>
            Already have an account?
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              {' '}Sign In
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
    paddingTop: 55,
    paddingBottom: 35,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    fontSize: 15,
    fontWeight: '700',
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 55,
    height: 55,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  brandName: {
    fontSize: 23,
    fontWeight: '800',
  },

  brandTagline: {
    fontSize: 12,
    marginTop: 5,
  },

  headingContainer: {
    marginBottom: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 12,
    marginTop: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
    marginTop: 17,
  },

  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 11,
  },

  input: {
    flex: 1,
    fontSize: 13,
  },

  showPassword: {
    fontSize: 11,
    fontWeight: '700',
    paddingLeft: 8,
  },

  passwordHint: {
    fontSize: 11,
    marginTop: 10,
  },

  registerButton: {
    height: 57,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 27,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  loginText: {
    fontSize: 12,
  },

  loginLink: {
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 35,
  },
});
