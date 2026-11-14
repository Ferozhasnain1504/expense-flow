
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

export default function LoginScreen({ navigation }) {

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
      Alert.alert('Invalid password', 'Password must contain at least 6 characters.');
      return;
    }

    // Temporary frontend-only login.
    // Real JWT authentication will be implemented on Day 3.

    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B1020"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* BRAND */}

        <View style={styles.brandContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₹</Text>
          </View>

          <Text style={styles.brandName}>
            ExpenseFlow
          </Text>

          <Text style={styles.brandTagline}>
            Take control of your money.
          </Text>
        </View>


        {/* WELCOME */}

        <View style={styles.headingContainer}>
          <Text style={styles.heading}>
            Welcome Back!
          </Text>

          <Text style={styles.subtitle}>
            Sign in to continue managing your finances.
          </Text>
        </View>


        {/* EMAIL */}

        <Text style={styles.label}>
          Email Address
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>✉</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>


        {/* PASSWORD */}

        <Text style={styles.label}>
          Password
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPassword}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>


        {/* FORGOT PASSWORD */}

        <Pressable
          style={styles.forgotContainer}
          onPress={() => Alert.alert(
            'Forgot Password',
            'Password recovery will be implemented with backend authentication.'
          )}
        >
          <Text style={styles.forgotText}>
            Forgot Password?
          </Text>
        </Pressable>


        {/* LOGIN BUTTON */}

        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            Sign In →
          </Text>
        </Pressable>


        {/* REGISTER */}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don't have an account?
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLink}>
              {' '}Create Account
            </Text>
          </Pressable>
        </View>


        {/* FOOTER */}

        <Text style={styles.footer}>
          YOUR FINANCES. YOUR CONTROL.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 65,
    paddingBottom: 35,
  },

  // BRAND

  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },

  logo: {
    width: 65,
    height: 65,
    backgroundColor: '#6D4AFF',
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
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  brandTagline: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 7,
  },


  // HEADING

  headingContainer: {
    marginBottom: 30,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 9,
    lineHeight: 20,
  },


  // INPUTS

  label: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
  },

  inputContainer: {
    height: 58,
    backgroundColor: '#19243B',
    borderWidth: 1,
    borderColor: '#27334C',
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
    color: '#FFFFFF',
    fontSize: 14,
  },

  showPassword: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    paddingLeft: 8,
  },


  // FORGOT PASSWORD

  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: 15,
  },

  forgotText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
  },


  // LOGIN BUTTON

  loginButton: {
    height: 58,
    backgroundColor: '#6D4AFF',
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


  // REGISTER

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },

  registerText: {
    color: '#94A3B8',
    fontSize: 13,
  },

  registerLink: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '800',
  },


  // FOOTER

  footer: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 55,
  },

});
