
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Other',
];

export default function AddExpenseScreen({ navigation }) {
  const { addExpense } = useExpenses();
  const { theme } = useTheme();
  const colors = theme.colors;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert(
        'Missing details',
        'Please enter expense title and amount.'
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        'Invalid amount',
        'Please enter a valid amount greater than zero.'
      );
      return;
    }

    try {
      setLoading(true);

      await addExpense({
        title: title.trim(),
        amount: numericAmount,
        category,
        date: new Date().toISOString(),
      });

      setTitle('');
      setAmount('');
      setCategory('Food');

      Alert.alert(
        'Success',
        'Your expense has been saved successfully!'
      );

      navigation.goBack();
    } catch (error) {
      console.log(
        'Save expense error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Failed to save expense',
        error.response?.data?.message ||
          'Unable to save your expense. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.back, { color: colors.primary }]}>
            ← Back to Dashboard
          </Text>
        </Pressable>

        <Text style={[styles.heading, { color: colors.text }]}>
          Add Expense
        </Text>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Record where your money goes.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>
          Expense Title
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. Grocery shopping"
          placeholderTextColor={colors.secondaryText}
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Amount (₹)
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Enter amount"
          placeholderTextColor={colors.secondaryText}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Select Category
        </Text>

        <View style={styles.categories}>
          {categories.map((item) => {
            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                disabled={loading}
                style={[
                  styles.category,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.card,
                    borderColor: selected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selected ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>
              Save Expense
            </Text>
          )}
        </Pressable>
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
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },

  back: {
    fontSize: 15,
    marginBottom: 30,
    fontWeight: '600',
  },

  heading: {
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
  },

  label: {
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
  },

  input: {
    borderRadius: 14,
    padding: 17,
    fontSize: 16,
    borderWidth: 1,
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  category: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  categoryText: {
    fontWeight: '600',
  },

  saveButton: {
    padding: 19,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 35,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
