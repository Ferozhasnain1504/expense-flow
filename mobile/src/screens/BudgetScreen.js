
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

const getMonthName = (date) =>
  date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

export default function BudgetScreen() {
  const {
    budget,
    budgetLoading,
    refreshBudget,
    saveMonthlyBudget,
  } = useExpenses();

  const { theme, isDark } = useTheme();
  const colors = theme.colors;

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [totalLimit, setTotalLimit] = useState('');
  const [categoryRows, setCategoryRows] = useState([]);
  const [showEditor, setShowEditor] = useState(false);

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const hasCurrentBudget =
    budget &&
    budget.month === month &&
    budget.year === year;

  useEffect(() => {
    let active = true;

    const loadBudget = async () => {
      try {
        const result = await refreshBudget(month, year);

        if (active && !result) {
          setShowEditor(true);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'Error',
            'Unable to load your monthly budget. Please try again.'
          );
        }
      }
    };

    loadBudget();

    return () => {
      active = false;
    };
  }, [month, year, refreshBudget]);

  useEffect(() => {
    if (hasCurrentBudget) {
      setTotalLimit(String(budget.totalLimit));

      setCategoryRows(
        (budget.categoryBudgets || []).map((item) => ({
          category: item.category,
          limit: String(item.limit),
        }))
      );
    } else if (!budget) {
      setTotalLimit('');
      setCategoryRows([]);
    }
  }, [budget, month, year]);

  const changeMonth = (direction) => {
    setSelectedDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + direction,
          1
        )
    );
    setShowEditor(false);
  };

  const updateCategoryRow = (index, field, value) => {
    setCategoryRows((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addCategoryRow = () => {
    setCategoryRows((previous) => [
      ...previous,
      { category: '', limit: '' },
    ]);
  };

  const removeCategoryRow = (index) => {
    setCategoryRows((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSaveBudget = async () => {
    const parsedTotal = Number(totalLimit);

    if (
      !totalLimit.trim() ||
      !Number.isFinite(parsedTotal) ||
      parsedTotal <= 0
    ) {
      Alert.alert(
        'Invalid Budget',
        'Please enter a valid monthly budget greater than zero.'
      );
      return;
    }

    const categories = [];

    for (const item of categoryRows) {
      const category = item.category.trim();

      if (!category) continue;

      const limit = Number(item.limit);

      if (
        !item.limit.trim() ||
        !Number.isFinite(limit) ||
        limit < 0
      ) {
        Alert.alert(
          'Invalid Category Budget',
          `Please enter a valid limit for ${category}.`
        );
        return;
      }

      categories.push({ category, limit });
    }

    try {
      await saveMonthlyBudget({
        month,
        year,
        totalLimit: parsedTotal,
        categoryBudgets: categories,
      });

      setShowEditor(false);

      Alert.alert(
        'Success',
        'Your monthly budget has been saved!'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Unable to save your budget.'
      );
    }
  };

  const percentage = hasCurrentBudget
    ? Number(budget.percentageUsed || 0)
    : 0;

  const progressWidth = Math.min(
    Math.max(percentage, 0),
    100
  );

  const progressColor =
    percentage >= 100
      ? colors.danger
      : percentage >= 80
        ? '#F59E0B'
        : '#10B981';

  const spendingMessage =
    percentage >= 100
      ? 'You have exceeded your monthly budget!'
      : percentage >= 80
        ? 'You are approaching your monthly budget limit.'
        : 'You are within your monthly budget.';

  const categorySummary = hasCurrentBudget
    ? budget.categorySummary || []
    : [];

  const styles = createStyles(colors);

  const renderSectionHeading = (eyebrow, heading, description) => (
    <View style={styles.sectionHeading}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{heading}</Text>
      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR FINANCES</Text>
          <Text style={styles.heading}>Budgets</Text>
          <Text style={styles.subtitle}>
            Plan your spending. Stay in control.
          </Text>
        </View>

        {/* MONTH SELECTOR */}
        <View style={styles.monthSelector}>
          <Pressable
            onPress={() => changeMonth(-1)}
            style={({ pressed }) => [
              styles.monthButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.monthArrow}>‹</Text>
          </Pressable>

          <View style={styles.monthCenter}>
            <Text style={styles.monthLabel}>SELECTED PERIOD</Text>
            <Text style={styles.monthText}>
              {getMonthName(selectedDate)}
            </Text>
          </View>

          <Pressable
            onPress={() => changeMonth(1)}
            style={({ pressed }) => [
              styles.monthButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.monthArrow}>›</Text>
          </Pressable>
        </View>

        {budgetLoading && !hasCurrentBudget ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text style={styles.loadingText}>
              Loading your budget...
            </Text>
          </View>
        ) : (
          <>
            {/* BUDGET OVERVIEW */}
            {hasCurrentBudget ? (
              <>
                <View style={styles.overviewCard}>
                  <View style={styles.overviewTopRow}>
                    <View>
                      <Text style={styles.overviewLabel}>
                        MONTHLY SPENDING LIMIT
                      </Text>
                      <Text style={styles.totalLimit}>
                        {formatCurrency(budget.totalLimit)}
                      </Text>
                    </View>

                    <View style={styles.budgetIcon}>
                      <Text style={styles.budgetIconText}>₹</Text>
                    </View>
                  </View>

                  <View style={styles.overviewDivider} />

                  <View style={styles.spendingRow}>
                    <View style={styles.spendingColumn}>
                      <Text style={styles.smallLabel}>Spent so far</Text>
                      <Text style={styles.spentAmount}>
                        {formatCurrency(budget.totalSpent)}
                      </Text>
                    </View>

                    <View style={styles.spendingColumn}>
                      <Text style={styles.smallLabel}>Remaining</Text>
                      <Text
                        style={[
                          styles.remainingAmount,
                          {
                            color:
                              budget.remaining < 0
                                ? colors.danger
                                : '#10B981',
                          },
                        ]}
                      >
                        {formatCurrency(budget.remaining)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressHeader}>
                    <Text style={styles.progressHeading}>
                      Budget usage
                    </Text>
                    <Text
                      style={[
                        styles.progressPercentage,
                        { color: progressColor },
                      ]}
                    >
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressWidth}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.progressInfo}>
                    <Text style={styles.progressInfoText}>
                      0% used
                    </Text>
                    <Text style={styles.progressInfoText}>
                      100% limit
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusMessage,
                      {
                        backgroundColor: `${progressColor}18`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: progressColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: progressColor },
                      ]}
                    >
                      {spendingMessage}
                    </Text>
                  </View>
                </View>

                {/* CATEGORY BUDGETS */}
                {renderSectionHeading(
                  'SPENDING BREAKDOWN',
                  'Category budgets',
                  'Track how much you spend in each category.'
                )}

                {categorySummary.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>
                      No category budgets
                    </Text>
                    <Text style={styles.emptyDescription}>
                      Add category limits to monitor individual
                      spending areas.
                    </Text>
                  </View>
                ) : (
                  categorySummary.map((item) => {
                    const used =
                      item.limit > 0
                        ? (item.spent / item.limit) * 100
                        : 0;

                    const categoryColor =
                      used >= 100
                        ? colors.danger
                        : used >= 80
                          ? '#F59E0B'
                          : '#10B981';

                    return (
                      <View
                        key={item.category}
                        style={styles.categoryCard}
                      >
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryNameContainer}>
                            <Text style={styles.categoryName}>
                              {item.category}
                            </Text>
                            <Text style={styles.categorySubtext}>
                              {formatCurrency(item.spent)} of{' '}
                              {formatCurrency(item.limit)}
                            </Text>
                          </View>

                          <View style={styles.categoryPercentageContainer}>
                            <Text
                              style={[
                                styles.categoryPercentage,
                                { color: categoryColor },
                              ]}
                            >
                              {used.toFixed(1)}%
                            </Text>
                            <Text style={styles.categoryUsedLabel}>
                              used
                            </Text>
                          </View>
                        </View>

                        <View style={styles.progressBackground}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(used, 100)}%`,
                                backgroundColor: categoryColor,
                              },
                            ]}
                          />
                        </View>

                        <View style={styles.categoryFooter}>
                          <Text style={styles.categoryRemaining}>
                            {formatCurrency(item.remaining)} remaining
                          </Text>

                          {used >= 100 ? (
                            <Text
                              style={[
                                styles.categoryStatus,
                                { color: colors.danger },
                              ]}
                            >
                              Limit exceeded
                            </Text>
                          ) : used >= 80 ? (
                            <Text
                              style={[
                                styles.categoryStatus,
                                { color: '#F59E0B' },
                              ]}
                            >
                              Almost at limit
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.categoryStatus,
                                { color: '#10B981' },
                              ]}
                            >
                              Within limit
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={styles.emptyTitle}>
                  No budget set yet
                </Text>
                <Text style={styles.emptyDescription}>
                  Set a monthly spending limit and start tracking
                  your finances. You can also create limits for
                  individual categories.
                </Text>
              </View>
            )}

            {/* EDITOR TOGGLE */}
            {!showEditor && (
              <Pressable
                onPress={() => setShowEditor(true)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {hasCurrentBudget
                    ? '✎  Edit Monthly Budget'
                    : '+  Set Monthly Budget'}
                </Text>
              </Pressable>
            )}

            {/* BUDGET EDITOR */}
            {showEditor && (
              <View style={styles.editorCard}>
                {renderSectionHeading(
                  'BUDGET SETTINGS',
                  hasCurrentBudget ? 'Update your budget' : 'Create a budget',
                  `Set your spending limits for ${getMonthName(selectedDate)}.`
                )}

                <Text style={styles.inputLabel}>
                  Total monthly limit
                </Text>

                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={totalLimit}
                    onChangeText={setTotalLimit}
                    keyboardType="numeric"
                    placeholder="Enter monthly budget"
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>

                <View style={styles.editorDivider} />

                <Text style={styles.inputLabel}>
                  Category limits
                </Text>
                <Text style={styles.inputHint}>
                  Add a separate spending limit for each category.
                </Text>

                {categoryRows.map((item, index) => (
                  <View
                    key={index}
                    style={styles.categoryInputCard}
                  >
                    <View style={styles.categoryInputHeader}>
                      <Text style={styles.categoryInputNumber}>
                        CATEGORY {index + 1}
                      </Text>

                      <Pressable
                        onPress={() => removeCategoryRow(index)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeText}>Remove ×</Text>
                      </Pressable>
                    </View>

                    <TextInput
                      style={styles.input}
                      value={item.category}
                      onChangeText={(value) =>
                        updateCategoryRow(index, 'category', value)
                      }
                      placeholder="Category name"
                      placeholderTextColor={colors.secondaryText}
                    />

                    <View style={styles.categoryLimitInput}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.categoryLimitTextInput}
                        value={item.limit}
                        onChangeText={(value) =>
                          updateCategoryRow(index, 'limit', value)
                        }
                        keyboardType="numeric"
                        placeholder="Enter category limit"
                        placeholderTextColor={colors.secondaryText}
                      />
                    </View>
                  </View>
                ))}

                <Pressable
                  onPress={addCategoryRow}
                  style={styles.addCategoryButton}
                >
                  <Text style={styles.addCategoryText}>
                    + Add another category
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveBudget}
                  disabled={budgetLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    budgetLoading && styles.disabledButton,
                    pressed && !budgetLoading && styles.buttonPressed,
                  ]}
                >
                  {budgetLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Save Budget
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowEditor(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
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
      marginBottom: 25,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.8,
      color: colors.primary,
      marginBottom: 8,
    },
    heading: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 7,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 18,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthArrow: {
      color: colors.text,
      fontSize: 28,
      lineHeight: 32,
    },
    monthCenter: {
      alignItems: 'center',
    },
    monthLabel: {
      fontSize: 9,
      color: colors.secondaryText,
      letterSpacing: 1.2,
      fontWeight: '700',
      marginBottom: 4,
    },
    monthText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    pressed: {
      opacity: 0.7,
    },
    overviewCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 22,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },
    overviewTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    overviewLabel: {
      color: colors.secondaryText,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.1,
    },
    totalLimit: {
      fontSize: 34,
      fontWeight: '800',
      color: colors.text,
      marginTop: 9,
      letterSpacing: -0.8,
    },
    budgetIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: `${colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    budgetIconText: {
      color: colors.primary,
      fontSize: 25,
      fontWeight: '800',
    },
    overviewDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },
    spendingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    spendingColumn: {
      flex: 1,
    },
    smallLabel: {
      color: colors.secondaryText,
      fontSize: 12,
      marginBottom: 7,
    },
    spentAmount: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    remainingAmount: {
      fontSize: 20,
      fontWeight: '800',
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    progressHeading: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: '800',
    },
    progressBackground: {
      height: 9,
      borderRadius: 20,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    progressFill: {
      height: 9,
      borderRadius: 20,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    progressInfoText: {
      color: colors.secondaryText,
      fontSize: 10,
    },
    statusMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginTop: 19,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 5,
      marginRight: 9,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      flex: 1,
    },
    sectionHeading: {
      marginBottom: 17,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    sectionDescription: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 19,
    },
    categoryCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    categoryNameContainer: {
      flex: 1,
    },
    categoryName: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    categorySubtext: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 6,
    },
    categoryPercentageContainer: {
      alignItems: 'flex-end',
    },
    categoryPercentage: {
      fontSize: 16,
      fontWeight: '800',
    },
    categoryUsedLabel: {
      fontSize: 10,
      color: colors.secondaryText,
      marginTop: 2,
    },
    categoryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    categoryRemaining: {
      color: colors.secondaryText,
      fontSize: 11,
    },
    categoryStatus: {
      fontSize: 10,
      fontWeight: '700',
    },
    emptyCard: {
      backgroundColor: colors.card,
      padding: 28,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      fontSize: 38,
      marginBottom: 13,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: '800',
      marginBottom: 8,
    },
    emptyDescription: {
      color: colors.secondaryText,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 17,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      minHeight: 54,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
    disabledButton: {
      opacity: 0.6,
    },
    editorCard: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 19,
      marginTop: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 9,
    },
    inputHint: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: -3,
      marginBottom: 15,
      lineHeight: 18,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 13,
      paddingHorizontal: 14,
      height: 55,
    },
    currencySymbol: {
      color: colors.primary,
      fontSize: 19,
      fontWeight: '800',
      marginRight: 9,
    },
    amountInput: {
      flex: 1,
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
      height: '100%',
    },
    editorDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 23,
    },
    categoryInputCard: {
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 13,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryInputHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11,
    },
    categoryInputNumber: {
      color: colors.secondaryText,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.1,
    },
    removeButton: {
      paddingVertical: 4,
      paddingHorizontal: 7,
    },
    removeText: {
      color: colors.danger,
      fontSize: 11,
      fontWeight: '700',
    },
    input: {
      height: 47,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: colors.text,
      backgroundColor: colors.card,
      fontSize: 13,
      marginBottom: 9,
    },
    categoryLimitInput: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 47,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
    },
    categoryLimitTextInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 13,
    },
    addCategoryButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10,
    },
    addCategoryText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    cancelButton: {
      alignItems: 'center',
      padding: 15,
    },
    cancelText: {
      color: colors.secondaryText,
      fontSize: 13,
      fontWeight: '700',
    },
    loadingContainer: {
      paddingVertical: 65,
      alignItems: 'center',
    },
    loadingText: {
      color: colors.secondaryText,
      marginTop: 13,
      fontSize: 13,
    },
  });
