
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
  StatusBar,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

import {
  fetchRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from '../services/recurringExpenseService';

import {
  requestNotificationPermissions,
  scheduleRecurringExpenseReminder,
  cancelRecurringExpenseReminder,
} from '../services/notificationService';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Other',
];

const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];

const categoryIcons = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Bills: '📄',
  Other: '📌',
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function RecurringExpensesScreen() {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

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

  const loadRecurringExpenses = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecurringExpenses();
    }, [loadRecurringExpenses])
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

    if (
      parsedStartDate.getFullYear() !== Number(startDate.slice(0, 4)) ||
      parsedStartDate.getMonth() + 1 !== Number(startDate.slice(5, 7)) ||
      parsedStartDate.getDate() !== Number(startDate.slice(8, 10))
    ) {
      Alert.alert('Invalid date', 'Enter a real calendar date.');
      return;
    }

    if (endDate) {
      const validEndDate = /^\d{4}-\d{2}-\d{2}$/.test(endDate);
      const parsedEndDate = new Date(`${endDate}T00:00:00`);

      if (
        !validEndDate ||
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate ||
        parsedEndDate.getFullYear() !== Number(endDate.slice(0, 4)) ||
        parsedEndDate.getMonth() + 1 !== Number(endDate.slice(5, 7)) ||
        parsedEndDate.getDate() !== Number(endDate.slice(8, 10))
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

      let savedExpense;

      if (editingId) {
        savedExpense = await updateRecurringExpense(editingId, payload);
      } else {
        savedExpense = await createRecurringExpense(payload);
      }

      if (savedExpense?.isActive !== false) {
        const permissionGranted = await requestNotificationPermissions();

        if (permissionGranted) {
          const notificationId =
            await scheduleRecurringExpenseReminder(savedExpense);

          console.log('Recurring reminder ID:', notificationId);
        }
      } else if (savedExpense?._id) {
        await cancelRecurringExpenseReminder(savedExpense._id);
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

  const handleToggleActive = async (item) => {
    try {
      const updatedExpense = await updateRecurringExpense(item._id, {
        isActive: !item.isActive,
      });

      if (item.isActive) {
        await cancelRecurringExpenseReminder(item._id);
      } else {
        const permissionGranted = await requestNotificationPermissions();

        if (permissionGranted) {
          await scheduleRecurringExpenseReminder(updatedExpense);
        }
      }

      await loadRecurringExpenses();
    } catch (error) {
      console.error('Toggle recurring expense error:', error);
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
              await cancelRecurringExpenseReminder(item._id);
              await loadRecurringExpenses();
            } catch (error) {
              Alert.alert('Error', 'Could not delete recurring expense.');
            }
          },
        },
      ]
    );
  };

  const activeExpenses = recurringExpenses.filter(
    (item) => item.isActive
  );

  const pausedExpenses = recurringExpenses.filter(
    (item) => !item.isActive
  );

  const totalMonthlyCommitment = activeExpenses.reduce((total, item) => {
    const value = Number(item.amount);

    const monthlyValue = {
      daily: value * 30,
      weekly: value * (52 / 12),
      monthly: value,
      yearly: value / 12,
    }[item.frequency];

    return total + monthlyValue;
  }, 0);

  const renderInput = (
    label,
    value,
    onChangeText,
    placeholder,
    options = {}
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          options.multiline && styles.notesInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline || false}
        autoCapitalize={options.autoCapitalize || 'sentences'}
        maxLength={options.maxLength}
      />
    </>
  );

  const renderExpenseCard = (item) => (
    <View
      key={item._id}
      style={[
        styles.expenseCard,
        !item.isActive && styles.pausedCard,
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTitleRow}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryIconText}>
              {categoryIcons[item.category] || '📌'}
            </Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.expenseTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.categoryText}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.amountCaption}>per cycle</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        <View style={styles.frequencyBadge}>
          <Text style={styles.frequencyText}>
            {item.frequency.toUpperCase()}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.isActive
                ? '#10B98118'
                : colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.isActive
                  ? '#10B981'
                  : colors.secondaryText,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: item.isActive
                  ? '#10B981'
                  : colors.secondaryText,
              },
            ]}
          >
            {item.isActive ? 'Active' : 'Paused'}
          </Text>
        </View>
      </View>

      <View style={styles.dueDateContainer}>
        <Text style={styles.dueDateLabel}>NEXT PAYMENT</Text>
        <Text style={styles.dueDate}>
          {formatDate(item.nextDueDate)}
        </Text>
      </View>

      {item.notes ? (
        <Text style={styles.notesText} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => handleEdit(item)}
          style={styles.actionButton}
        >
          <Text style={styles.editActionText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => handleToggleActive(item)}
          style={styles.actionButton}
        >
          <Text style={styles.editActionText}>
            {item.isActive ? 'Pause' : 'Resume'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleDelete(item)}
          style={[styles.actionButton, styles.deleteActionButton]}
        >
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>AUTOMATE YOUR FINANCES</Text>
          <Text style={styles.heading}>Recurring expenses</Text>
          <Text style={styles.subtitle}>
            Keep track of subscriptions and regular payments.
          </Text>
        </View>

        {/* MONTHLY COMMITMENT */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>↻</Text>
            </View>
            <Text style={styles.summaryTag}>MONTHLY ESTIMATE</Text>
          </View>

          <Text style={styles.summaryAmount}>
            {formatCurrency(totalMonthlyCommitment)}
          </Text>

          <Text style={styles.summaryCaption}>
            Estimated commitment from active recurring expenses
          </Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStats}>
            <View>
              <Text style={styles.summaryStatValue}>
                {activeExpenses.length}
              </Text>
              <Text style={styles.summaryStatLabel}>Active</Text>
            </View>

            <View style={styles.summaryStatDivider} />

            <View>
              <Text style={styles.summaryStatValue}>
                {pausedExpenses.length}
              </Text>
              <Text style={styles.summaryStatLabel}>Paused</Text>
            </View>

            <View style={styles.summaryStatDivider} />

            <View>
              <Text style={styles.summaryStatValue}>
                {recurringExpenses.length}
              </Text>
              <Text style={styles.summaryStatLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* ADD BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          <Text style={styles.addButtonText}>
            {showForm ? '×  Close form' : '+  Add recurring expense'}
          </Text>
        </Pressable>

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.eyebrow}>EXPENSE DETAILS</Text>
              <Text style={styles.formTitle}>
                {editingId ? 'Edit recurring expense' : 'New recurring expense'}
              </Text>
              <Text style={styles.formDescription}>
                Enter the details of your regular payment.
              </Text>
            </View>

            {renderInput(
              'Expense title *',
              title,
              setTitle,
              'e.g. Netflix Subscription',
              { maxLength: 60 }
            )}

            {renderInput(
              'Amount (₹) *',
              amount,
              setAmount,
              'Enter amount',
              { keyboardType: 'decimal-pad' }
            )}

            <Text style={styles.label}>Category *</Text>
            <View style={styles.options}>
              {categories.map((item) => {
                const selected = category === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.option,
                      selected && styles.selectedOption,
                    ]}
                  >
                    <Text style={styles.optionEmoji}>
                      {categoryIcons[item]}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Payment frequency *</Text>
            <View style={styles.frequencyOptions}>
              {frequencies.map((item) => {
                const selected = frequency === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFrequency(item)}
                    style={[
                      styles.frequencyOption,
                      selected && styles.selectedFrequencyOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {renderInput(
              'Start date * (YYYY-MM-DD)',
              startDate,
              setStartDate,
              '2026-11-16',
              { autoCapitalize: 'none' }
            )}

            {renderInput(
              'End date (optional)',
              endDate,
              setEndDate,
              'Leave empty for no end date',
              { autoCapitalize: 'none' }
            )}

            {renderInput(
              'Notes (optional)',
              notes,
              setNotes,
              'Add a note about this payment',
              { multiline: true, maxLength: 200 }
            )}

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                saving && styles.disabledButton,
                pressed && !saving && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>
                  {editingId ? 'Update recurring expense' : 'Save recurring expense'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={resetForm}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* RECURRING EXPENSE LIST */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>YOUR REGULAR PAYMENTS</Text>
            <Text style={styles.sectionTitle}>Your subscriptions</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {recurringExpenses.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Loading recurring expenses...
            </Text>
          </View>
        ) : recurringExpenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔁</Text>
            <Text style={styles.emptyTitle}>
              No recurring expenses yet
            </Text>
            <Text style={styles.emptyText}>
              Add your subscriptions and regular payments to keep
              track of what you pay repeatedly.
            </Text>
          </View>
        ) : (
          <>
            {activeExpenses.length > 0 && (
              <>
                <View style={styles.listSectionHeading}>
                  <Text style={styles.listSectionTitle}>
                    Active payments
                  </Text>
                  <Text style={styles.listSectionCount}>
                    {activeExpenses.length}
                  </Text>
                </View>

                {activeExpenses.map(renderExpenseCard)}
              </>
            )}

            {pausedExpenses.length > 0 && (
              <>
                <View style={styles.listSectionHeading}>
                  <Text style={styles.listSectionTitle}>
                    Paused payments
                  </Text>
                  <Text style={styles.listSectionCount}>
                    {pausedExpenses.length}
                  </Text>
                </View>

                {pausedExpenses.map(renderExpenseCard)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 45,
    },
    header: {
      marginTop: 35,
      marginBottom: 23,
    },
    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 7,
      lineHeight: 19,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      borderRadius: 23,
      padding: 22,
      marginBottom: 17,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#FFFFFF25',
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryIconText: {
      color: '#FFFFFF',
      fontSize: 26,
      fontWeight: '700',
    },
    summaryTag: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    summaryAmount: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: '800',
      marginTop: 18,
      letterSpacing: -0.5,
    },
    summaryCaption: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 11,
      marginTop: 6,
      lineHeight: 17,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: '#FFFFFF40',
      marginVertical: 19,
    },
    summaryStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryStatValue: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
    },
    summaryStatLabel: {
      color: '#FFFFFF',
      opacity: 0.8,
      fontSize: 10,
      marginTop: 4,
    },
    summaryStatDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#FFFFFF50',
    },
    addButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 16,
      borderRadius: 15,
      alignItems: 'center',
      marginBottom: 25,
    },
    addButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '800',
    },
    buttonPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.99 }],
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginBottom: 28,
    },
    formHeader: {
      marginBottom: 12,
    },
    formTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: '800',
    },
    formDescription: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: 6,
      lineHeight: 18,
    },
    label: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 18,
      marginBottom: 9,
    },
    input: {
      backgroundColor: colors.background,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 13,
      fontSize: 14,
    },
    notesInput: {
      minHeight: 85,
      textAlignVertical: 'top',
    },
    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: 11,
      paddingHorizontal: 11,
      paddingVertical: 11,
    },
    selectedOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionEmoji: {
      fontSize: 13,
    },
    optionText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '700',
    },
    selectedOptionText: {
      color: '#FFFFFF',
    },
    frequencyOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    frequencyOption: {
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    selectedFrequencyOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    frequencyOptionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 13,
      alignItems: 'center',
      marginTop: 24,
      minHeight: 52,
      justifyContent: 'center',
    },
    saveText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    disabledButton: {
      opacity: 0.6,
    },
    cancelButton: {
      alignItems: 'center',
      padding: 14,
    },
    cancelText: {
      color: colors.secondaryText,
      fontSize: 13,
      fontWeight: '700',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 17,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: '800',
    },
    countBadge: {
      minWidth: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
    },
    countText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    listSectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7,
      marginBottom: 12,
      gap: 9,
    },
    listSectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    listSectionCount: {
      color: colors.secondaryText,
      fontSize: 11,
      fontWeight: '700',
    },
    expenseCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pausedCard: {
      opacity: 0.75,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    categoryIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    categoryIconText: {
      fontSize: 19,
    },
    titleContainer: {
      flex: 1,
    },
    expenseTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    categoryText: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 5,
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    amount: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: '800',
    },
    amountCaption: {
      color: colors.secondaryText,
      fontSize: 9,
      marginTop: 3,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 15,
    },
    cardDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    frequencyBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
    },
    frequencyText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
    },
    dueDateContainer: {
      marginTop: 16,
    },
    dueDateLabel: {
      color: colors.secondaryText,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
    },
    dueDate: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 5,
    },
    notesText: {
      color: colors.secondaryText,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 11,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 17,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 11,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editActionText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '800',
    },
    deleteActionButton: {
      backgroundColor: `${colors.danger}15`,
    },
    deleteActionText: {
      color: colors.danger,
      fontSize: 11,
      fontWeight: '800',
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 28,
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 39,
      marginBottom: 14,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    emptyText: {
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 9,
    },
    loadingContainer: {
      paddingVertical: 45,
      alignItems: 'center',
    },
    loadingText: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: 12,
    },
  });
