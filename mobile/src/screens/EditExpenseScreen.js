
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
import { useTheme } from '../context/ThemeContext';

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

  const { theme } = useTheme();
  const colors = theme.colors;

  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);

  const handleUpdate = () => {
    const numericAmount = Number(amount);

    if (!title.trim() || !amount.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter a title and amount.'
      );
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        'Invalid amount',
        'Enter an amount greater than zero.'
      );
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
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← Back
          </Text>
        </Pressable>

        <Text style={[styles.heading, { color: colors.text }]}>
          Edit Expense
        </Text>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Update your transaction details
        </Text>
      </View>

      <View
        style={[
          styles.form,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          Expense title
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Groceries"
          placeholderTextColor={colors.secondaryText}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Amount (₹)
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="Enter amount"
          placeholderTextColor={colors.secondaryText}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Category
        </Text>

        <View style={styles.categories}>
          {CATEGORIES.map((item) => {
            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.surface,
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
                      fontWeight: selected ? '700' : '500',
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
            { backgroundColor: colors.primary },
          ]}
          onPress={handleUpdate}
        >
          <Text style={styles.saveButtonText}>
            Save Changes
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginTop: 45,
    marginBottom: 30,
  },

  backText: {
    fontSize: 15,
    marginBottom: 22,
    fontWeight: '600',
  },

  heading: {
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 7,
  },

  form: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
    marginTop: 15,
  },

  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },

  categoryText: {
    fontSize: 13,
  },

  saveButton: {
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
