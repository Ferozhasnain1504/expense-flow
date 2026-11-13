
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
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
  const { addExpense } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Missing details', 'Please enter title and amount.');
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount greater than zero.');
      return;
    }

    addExpense({
      title: title.trim(),
      amount: numericAmount,
      category,
      date: new Date().toLocaleDateString(),
    });

    Alert.alert('Success', 'Expense added successfully!');

    setTitle('');
    setAmount('');
    setCategory('Food');

    onBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.heading}>Add Expense</Text>

      <Text style={styles.subtitle}>
        Record where your money goes.
      </Text>

      <Text style={styles.label}>Expense Title</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Grocery shopping"
        placeholderTextColor="#94A3B8"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Amount (₹)</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        placeholderTextColor="#94A3B8"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Category</Text>

      <View style={styles.categories}>
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.category,
              category === item && styles.selectedCategory,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.selectedCategoryText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSubmit}
      >
        <Text style={styles.saveText}>Save Expense</Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B1020',
    padding: 22,
    paddingTop: 55,
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
    marginTop: 18,
  },

  input: {
    backgroundColor: '#19243B',
    borderRadius: 14,
    padding: 17,
    color: '#FFFFFF',
    fontSize: 16,
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
    padding: 13,
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
