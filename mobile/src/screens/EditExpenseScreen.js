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

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

export default function EditExpenseScreen({ navigation, route }) {
  const { expense } = route.params;
  const { updateExpense } = useExpenses();

  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);

  const handleUpdate = () => {
    const numericAmount = Number(amount);

    if (!title.trim() || !amount.trim()) {
      Alert.alert('Missing information', 'Please enter a title and amount.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    updateExpense(expense.id, {
      title: title.trim(),
      amount: numericAmount,
      category,
    });

    Alert.alert('Success', 'Expense updated successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Edit Expense</Text>
        <Text style={styles.subtitle}>Update your transaction details</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Expense title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Groceries"
          placeholderTextColor="#777F95"
        />

        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="Enter amount"
          placeholderTextColor="#777F95"
        />

        <Text style={styles.label}>Category</Text>

        <View style={styles.categories}>
          {CATEGORIES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryButton,
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

        <Pressable style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    padding: 20,
  },
  header: {
    marginTop: 45,
    marginBottom: 30,
  },
  backText: {
    color: '#A78BFA',
    fontSize: 15,
    marginBottom: 22,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9298AA',
    fontSize: 14,
    marginTop: 7,
  },
  form: {
    backgroundColor: '#191F35',
    padding: 20,
    borderRadius: 18,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#252D45',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 15,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  categoryButton: {
    backgroundColor: '#252D45',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#8B5CF6',
  },
  categoryText: {
    color: '#A0A5B5',
    fontSize: 13,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});