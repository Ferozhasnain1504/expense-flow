
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

export default function RegisterScreen({ navigation }) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {

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

    // Temporary frontend-only registration.
    // Real account creation will use our Express API.

    Alert.alert(
      'Registration successful',
      'Your registration form is valid. Backend integration is coming next.',
      [
        {
          text: 'Continue to Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
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

        {/* BACK BUTTON */}

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>


        {/* BRAND */}

        <View style={styles.brandContainer}>

          <View style={styles.logo}>
            <Text style={styles.logoText}>
              ₹
            </Text>
          </View>

          <Text style={styles.brandName}>
            ExpenseFlow
          </Text>

          <Text style={styles.brandTagline}>
            Start your financial journey.
          </Text>

        </View>


        {/* HEADING */}

        <View style={styles.headingContainer}>

          <Text style={styles.heading}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join us and take control of your finances.
          </Text>

        </View>


        {/* FULL NAME */}

        <Text style={styles.label}>
          Full Name
        </Text>

        <View style={styles.inputContainer}>

          <Text style={styles.inputIcon}>
            👤
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={60}
          />

        </View>


        {/* EMAIL */}

        <Text style={styles.label}>
          Email Address
        </Text>

        <View style={styles.inputContainer}>

          <Text style={styles.inputIcon}>
            ✉
          </Text>

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

          <Text style={styles.inputIcon}>
            🔒
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Create a password"
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


        {/* CONFIRM PASSWORD */}

        <Text style={styles.label}>
          Confirm Password
        </Text>

        <View style={styles.inputContainer}>

          <Text style={styles.inputIcon}>
            🔐
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#64748B"
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
            <Text style={styles.showPassword}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>

        </View>


        {/* PASSWORD HINT */}

        <Text style={styles.passwordHint}>
          Use at least 8 characters for your password.
        </Text>


        {/* REGISTER BUTTON */}

        <Pressable
          style={styles.registerButton}
          onPress={handleRegister}
        >

          <Text style={styles.registerButtonText}>
            Create Account →
          </Text>

        </Pressable>


        {/* LOGIN LINK */}

        <View style={styles.loginContainer}>

          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLink}>
              {' '}Sign In
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
    paddingTop: 55,
    paddingBottom: 35,
  },


  // BACK BUTTON

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '700',
  },


  // BRAND

  brandContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 55,
    height: 55,
    backgroundColor: '#6D4AFF',
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
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  brandTagline: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },


  // HEADING

  headingContainer: {
    marginBottom: 20,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },


  // INPUTS

  label: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
    marginTop: 17,
  },

  inputContainer: {
    height: 55,
    backgroundColor: '#19243B',
    borderWidth: 1,
    borderColor: '#27334C',
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
    color: '#FFFFFF',
    fontSize: 13,
  },

  showPassword: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '700',
    paddingLeft: 8,
  },


  // PASSWORD HINT

  passwordHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 10,
  },


  // REGISTER BUTTON

  registerButton: {
    height: 57,
    backgroundColor: '#6D4AFF',
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


  // LOGIN LINK

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  loginText: {
    color: '#94A3B8',
    fontSize: 12,
  },

  loginLink: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '800',
  },


  // FOOTER

  footer: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 35,
  },

});
