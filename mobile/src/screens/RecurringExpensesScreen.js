
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

import {
  fetchRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from '../services/recurringExpenseService';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Other',
];

const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];

export default function RecurringExpensesScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecurringExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchRecurringExpenses();
      setRecurringExpenses(data);
    } catch (error) {
      console.log(
        'Recurring expenses loading error:',
        error.response?.data || error.message
      );

      Alert.alert('Error', 'Could not load recurring expenses.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecurringExpenses();
    }, [])
  );

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setAmount(String(item.amount));
    setCategory(item.category);
    setFrequency(item.frequency);
    setStartDate(item.startDate.slice(0, 10));
    setEndDate(item.endDate ? item.endDate.slice(0, 10) : '');
    setNotes(item.notes || '');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !amount.trim() || !startDate.trim()) {
      Alert.alert('Missing details', 'Please fill in all required fields.');
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(startDate);
    const parsedStartDate = new Date(`${startDate}T00:00:00`);

    if (!validDate || Number.isNaN(parsedStartDate.getTime())) {
      Alert.alert('Invalid date', 'Use the YYYY-MM-DD date format.');
      return;
    }

    if (endDate) {
      const parsedEndDate = new Date(`${endDate}T00:00:00`);

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate
      ) {
        Alert.alert(
          'Invalid end date',
          'Enter a valid end date on or after the start date.'
        );
        return;
      }
    }

    const payload = {
      title: title.trim(),
      amount: numericAmount,
      category,
      frequency,
      startDate: parsedStartDate.toISOString(),
      endDate: endDate
        ? new Date(`${endDate}T00:00:00`).toISOString()
        : null,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateRecurringExpense(editingId, payload);
      } else {
        await createRecurringExpense(payload);
      }

      await loadRecurringExpenses();
      resetForm();

      Alert.alert(
        'Success',
        editingId
          ? 'Recurring expense updated successfully.'
          : 'Recurring expense created successfully.'
      );
    } catch (error) {
      console.log(
        'Save recurring expense error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Unable to save',
        error.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString('en-IN')}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const handleToggleActive = async (item) => {
    try {
      await updateRecurringExpense(item._id, {
        isActive: !item.isActive,
      });

      await loadRecurringExpenses();
    } catch (error) {
      Alert.alert('Error', 'Could not update recurring expense.');
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete recurring expense',
      `Are you sure you want to delete ${item.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringExpense(item._id);
              await loadRecurringExpenses();
            } catch (error) {
              Alert.alert('Error', 'Could not delete recurring expense.');
            }
          },
        },
      ]
    );
  };

  const totalMonthlyCommitment = recurringExpenses
    .filter((item) => item.isActive)
    .reduce((total, item) => {
      const value = Number(item.amount);

      const monthlyValue = {
        daily: value * 30,
        weekly: value * (52 / 12),
        monthly: value,
        yearly: value / 12,
      }[item.frequency];

      return total + monthlyValue;
    }, 0);

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          Recurring Expenses
        </Text>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Manage subscriptions and regular payments
        </Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>
            Estimated monthly commitment
          </Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(totalMonthlyCommitment)}
          </Text>
          <Text style={styles.summaryCaption}>
            Across active recurring expenses
          </Text>
        </View>

        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form' : '+ Add Recurring Expense'}
          </Text>
        </Pressable>

        {showForm && (
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingId ? 'Edit Recurring Expense' : 'New Recurring Expense'}
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Expense Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Netflix Subscription"
              placeholderTextColor={colors.secondaryText}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Amount (₹) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
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
              Category *
            </Text>
            <View style={styles.options}>
              {categories.map((item) => {
                const selected = category === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.background,
                        borderColor: selected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? '#FFFFFF' : colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              Frequency *
            </Text>
            <View style={styles.options}>
              {frequencies.map((item) => {
                const selected = frequency === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFrequency(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.background,
                        borderColor: selected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? '#FFFFFF' : colors.text,
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              Start Date * (YYYY-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="2026-11-14"
              placeholderTextColor={colors.secondaryText}
              value={startDate}
              onChangeText={setStartDate}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.text }]}>
              End Date (Optional, YYYY-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Leave empty for no end date"
              placeholderTextColor={colors.secondaryText}
              value={endDate}
              onChangeText={setEndDate}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add a note"
              placeholderTextColor={colors.secondaryText}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Pressable
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: saving ? 0.7 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>
                  {editingId ? 'Update Recurring Expense' : 'Save Recurring Expense'}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your subscriptions
          </Text>
          <Text style={[styles.count, { color: colors.secondaryText }]}>
            {recurringExpenses.length} total
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : recurringExpenses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>🔁</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No recurring expenses yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Add your regular payments and subscriptions here.
            </Text>
          </View>
        ) : (
          recurringExpenses.map((item) => (
            <View
              key={item._id}
              style={[
                styles.expenseCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.expenseTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.categoryText, { color: colors.secondaryText }]}>
                    {item.category}
                  </Text>
                </View>

                <Text style={[styles.amount, { color: colors.primary }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>

              <View
                style={[
                  styles.frequencyBadge,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.frequencyText, { color: colors.primary }]}>
                  {item.frequency.toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.dueDate, { color: colors.secondaryText }]}>
                Next payment: {formatDate(item.nextDueDate)}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => handleEdit(item)}
                  style={[styles.actionButton, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleActive(item)}
                  style={[styles.actionButton, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    {item.isActive ? 'Pause' : 'Resume'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(item)}
                  style={[styles.actionButton, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.actionText, { color: colors.danger }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 45,
  },
  heading: {
    fontSize: 27,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 7,
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },
  summaryCaption: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 7,
    opacity: 0.85,
  },
  addButton: {
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 25,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
  },
  label: {
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 9,
  },
  input: {
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
  },
  notesInput: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  option: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  saveButton: {
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 25,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  count: {
    fontSize: 12,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  expenseCard: {
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  frequencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 15,
  },
  frequencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dueDate: {
    fontSize: 12,
    marginTop: 13,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
