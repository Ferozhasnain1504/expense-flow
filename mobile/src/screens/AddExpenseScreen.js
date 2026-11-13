
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
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Other',
];

export default function AddExpenseScreen({ onBack }) {

  // Access shared expense data
  const { addExpense } = useExpenses();

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  // Handle form submission
  const handleSubmit = () => {

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

    // Add expense to shared context
    addExpense({
      title: title.trim(),
      amount: numericAmount,
      category,
      date: new Date().toLocaleDateString(),
    });

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('Food');

    Alert.alert(
      'Success',
      'Your expense has been added successfully!'
    );

    onBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Back Button */}

        <Pressable onPress={onBack}>
          <Text style={styles.back}>
            ← Back to Dashboard
          </Text>
        </Pressable>

        {/* Heading */}

        <Text style={styles.heading}>
          Add Expense
        </Text>

        <Text style={styles.subtitle}>
          Record where your money goes.
        </Text>

        {/* Expense Title */}

        <Text style={styles.label}>
          Expense Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Grocery shopping"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />

        {/* Amount */}

        <Text style={styles.label}>
          Amount (₹)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Category */}

        <Text style={styles.label}>
          Select Category
        </Text>

        <View style={styles.categories}>
          {categories.map((item) => {

            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.category,
                  selected && styles.selectedCategory,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.selectedCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Save Button */}

        <Pressable
          style={styles.saveButton}
          onPress={handleSubmit}
        >
          <Text style={styles.saveText}>
            Save Expense
          </Text>
        </Pressable>

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
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },

  back: {
    color: '#A78BFA',
    fontSize: 15,
    marginBottom: 30,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 30,
  },

  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
  },

  input: {
    backgroundColor: '#19243B',
    borderRadius: 14,
    padding: 17,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#27334C',
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  category: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  selectedCategory: {
    backgroundColor: '#6D4AFF',
    borderColor: '#6D4AFF',
  },

  categoryText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#6D4AFF',
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
