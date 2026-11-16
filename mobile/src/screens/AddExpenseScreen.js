
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
  StatusBar,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

const categories = [
  { name: 'Food', icon: '🍔' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Bills', icon: '📄' },
  { name: 'Other', icon: '📦' },
];

export default function AddExpenseScreen({ navigation }) {
  const { addExpense } = useExpenses();
  const { theme } = useTheme();

  const colors = theme.colors;
  const isDark = theme.mode === 'dark';

  const styles = createStyles(colors, isDark);

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
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <Pressable
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.eyebrow}>
          TRANSACTION MANAGEMENT
        </Text>

        <Text style={styles.heading}>
          Add Expense
        </Text>

        <Text style={styles.subtitle}>
          Record your spending and stay in control of your money.
        </Text>

        {/* AMOUNT PREVIEW */}

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            EXPENSE AMOUNT
          </Text>

          <View style={styles.amountPreviewRow}>
            <Text style={styles.currencySymbol}>₹</Text>

            <Text style={styles.amountPreview}>
              {amount.trim()
                ? Number.isFinite(Number(amount))
                  ? Number(amount).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })
                  : amount
                : '0.00'}
            </Text>
          </View>

          <Text style={styles.amountHint}>
            Enter the amount you spent
          </Text>
        </View>

        {/* EXPENSE DETAILS */}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            Expense details
          </Text>

          {/* TITLE */}

          <Text style={styles.label}>
            Expense title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Grocery shopping"
            placeholderTextColor={colors.secondaryText}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            editable={!loading}
          />

          {/* AMOUNT */}

          <Text style={styles.label}>
            Amount
          </Text>

          <View style={styles.amountInputContainer}>
            <Text style={styles.inputCurrency}>
              ₹
            </Text>

            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              placeholderTextColor={colors.secondaryText}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              editable={!loading}
            />
          </View>

          {/* CATEGORY */}

          <View style={styles.categoryHeader}>
            <Text style={styles.label}>
              Select category
            </Text>

            <Text style={styles.categoryCount}>
              {category} selected
            </Text>
          </View>

          <View style={styles.categories}>
            {categories.map((item) => {
              const selected = category === item.name;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => setCategory(item.name)}
                  disabled={loading}
                  style={[
                    styles.categoryCard,
                    selected && styles.selectedCategory,
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      selected && styles.selectedCategoryIcon,
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>
                      {item.icon}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.selectedCategoryText,
                    ]}
                  >
                    {item.name}
                  </Text>

                  {selected && (
                    <Text style={styles.checkmark}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SAVE BUTTON */}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            loading && styles.disabledButton,
            pressed && !loading && styles.pressedButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>
                Save Expense
              </Text>

              <Text style={styles.saveButtonArrow}>
                →
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.footer}>
          Every small expense counts. Track it wisely. ✨
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// STYLES

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flexGrow: 1,
      paddingHorizontal: 21,
      paddingTop: 52,
      paddingBottom: 35,
    },

    // HEADER

    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 27,
      paddingVertical: 5,
    },

    backText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },

    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 9,
    },

    heading: {
      color: colors.text,
      fontSize: 29,
      fontWeight: '800',
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
      marginBottom: 25,
    },

    // AMOUNT PREVIEW

    amountCard: {
      backgroundColor: colors.primary,
      borderRadius: 23,
      padding: 23,
      marginBottom: 29,
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 9,
    },

    amountLabel: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.3,
      opacity: 0.9,
    },

    amountPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
    },

    currencySymbol: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '700',
      marginRight: 8,
    },

    amountPreview: {
      color: '#FFFFFF',
      fontSize: 35,
      fontWeight: '800',
      flexShrink: 1,
    },

    amountHint: {
      color: '#FFFFFF',
      fontSize: 11,
      opacity: 0.85,
      marginTop: 8,
    },

    // FORM

    formSection: {
      marginBottom: 10,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 18,
    },

    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 10,
      marginTop: 19,
    },

    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 16,
      color: colors.text,
      fontSize: 14,
    },

    // AMOUNT INPUT

    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 16,
      height: 55,
    },

    inputCurrency: {
      color: colors.primary,
      fontSize: 19,
      fontWeight: '800',
      marginRight: 12,
    },

    amountInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      height: '100%',
    },

    // CATEGORY

    categoryHeader: {
      marginTop: 5,
    },

    categoryCount: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 13,
    },

    categories: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    categoryCard: {
      width: '31.5%',
      minHeight: 103,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginBottom: 11,
      position: 'relative',
    },

    selectedCategory: {
      backgroundColor: isDark ? '#30264B' : '#F0E9FF',
      borderColor: colors.primary,
      borderWidth: 1.5,
    },

    categoryIcon: {
      width: 39,
      height: 39,
      borderRadius: 13,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    selectedCategoryIcon: {
      backgroundColor: isDark ? '#49386F' : '#E2D5FF',
    },

    categoryEmoji: {
      fontSize: 20,
    },

    categoryText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },

    selectedCategoryText: {
      color: colors.primary,
      fontWeight: '800',
    },

    checkmark: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '800',
      position: 'absolute',
      top: 7,
      right: 9,
    },

    // SAVE BUTTON

    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 25,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    saveButtonArrow: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '700',
      marginLeft: 10,
    },

    disabledButton: {
      opacity: 0.7,
    },

    pressedButton: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },

    // FOOTER

    footer: {
      color: colors.secondaryText,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 22,
    },
  });
