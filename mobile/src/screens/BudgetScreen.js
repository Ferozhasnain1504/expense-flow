
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
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

export default function BudgetScreen() {
  const {
    budget,
    budgetLoading,
    refreshBudget,
    saveMonthlyBudget,
  } = useExpenses();

  const { theme } = useTheme();
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

  // FETCH SELECTED MONTH'S BUDGET
  useEffect(() => {
    let active = true;

    const loadBudget = async () => {
      try {
        const result = await refreshBudget(month, year);

        if (active && !result) {
          setShowEditor(true);
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'Unable to load your monthly budget. Please try again.'
        );
      }
    };

    loadBudget();

    return () => {
      active = false;
    };
  }, [month, year, refreshBudget]);

  // LOAD EXISTING BUDGET INTO THE EDITOR
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

  // CHANGE MONTH
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

  // UPDATE CATEGORY ROW
  const updateCategoryRow = (index, field, value) => {
    setCategoryRows((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // ADD CATEGORY ROW
  const addCategoryRow = () => {
    setCategoryRows((previous) => [
      ...previous,
      { category: '', limit: '' },
    ]);
  };

  // REMOVE CATEGORY ROW
  const removeCategoryRow = (index) => {
    setCategoryRows((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // SAVE MONTHLY BUDGET
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

      if (!category) {
        continue;
      }

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

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Budgets
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.secondaryText },
          ]}
        >
          Take control of your spending
        </Text>
      </View>

      {/* MONTH SELECTOR */}
      <View style={styles.monthSelector}>
        <Pressable
          onPress={() => changeMonth(-1)}
          style={[
            styles.monthButton,
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.arrow, { color: colors.text }]}>
            ‹
          </Text>
        </Pressable>

        <Text style={[styles.monthText, { color: colors.text }]}>
          {selectedDate.toLocaleString('en-IN', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <Pressable
          onPress={() => changeMonth(1)}
          style={[
            styles.monthButton,
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.arrow, { color: colors.text }]}>
            ›
          </Text>
        </Pressable>
      </View>

      {budgetLoading && !hasCurrentBudget ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text
            style={[
              styles.loadingText,
              { color: colors.secondaryText },
            ]}
          >
            Loading budget...
          </Text>
        </View>
      ) : (
        <>
          {/* BUDGET OVERVIEW */}
          {hasCurrentBudget ? (
            <>
              <View
                style={[
                  styles.overviewCard,
                  { backgroundColor: colors.card },
                ]}
              >
                <Text
                  style={[
                    styles.cardLabel,
                    { color: colors.secondaryText },
                  ]}
                >
                  Monthly Budget
                </Text>

                <Text
                  style={[styles.totalLimit, { color: colors.text }]}
                >
                  {formatCurrency(budget.totalLimit)}
                </Text>

                <View style={styles.spendingRow}>
                  <View>
                    <Text
                      style={[
                        styles.smallLabel,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Spent
                    </Text>

                    <Text
                      style={[styles.amount, { color: colors.text }]}
                    >
                      {formatCurrency(budget.totalSpent)}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.smallLabel,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Remaining
                    </Text>

                    <Text
                      style={[
                        styles.amount,
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

                <View
                  style={[
                    styles.progressBackground,
                    { backgroundColor: colors.surface },
                  ]}
                >
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
                  <Text
                    style={[
                      styles.progressText,
                      { color: colors.secondaryText },
                    ]}
                  >
                    {percentage.toFixed(1)}% used
                  </Text>

                  <Text
                    style={[
                      styles.progressText,
                      { color: colors.secondaryText },
                    ]}
                  >
                    100%
                  </Text>
                </View>

                <Text
                  style={[
                    styles.warningText,
                    { color: progressColor },
                  ]}
                >
                  {spendingMessage}
                </Text>
              </View>

              {/* CATEGORY BUDGETS */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Category Budgets
              </Text>

              {categorySummary.length === 0 ? (
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Text
                    style={{ color: colors.secondaryText }}
                  >
                    No category budgets added yet.
                  </Text>
                </View>
              ) : (
                categorySummary.map((item, index) => {
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
                      style={[
                        styles.categoryCard,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <View style={styles.categoryHeader}>
                        <Text
                          style={[
                            styles.categoryName,
                            { color: colors.text },
                          ]}
                        >
                          {item.category}
                        </Text>

                        <Text
                          style={[
                            styles.categoryPercentage,
                            { color: categoryColor },
                          ]}
                        >
                          {used.toFixed(1)}%
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.categoryAmount,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {formatCurrency(item.spent)} spent of{' '}
                        {formatCurrency(item.limit)}
                      </Text>

                      <View
                        style={[
                          styles.progressBackground,
                          {
                            backgroundColor: colors.surface,
                            marginTop: 12,
                          },
                        ]}
                      >
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

                      <Text
                        style={[
                          styles.remainingText,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {formatCurrency(item.remaining)} remaining
                      </Text>
                    </View>
                  );
                })
              )}
            </>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.card },
              ]}
            >
              <Text style={styles.emptyIcon}>🎯</Text>

              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text },
                ]}
              >
                No budget set
              </Text>

              <Text
                style={[
                  styles.emptyDescription,
                  { color: colors.secondaryText },
                ]}
              >
                Set a monthly spending limit and start
                tracking your finances.
              </Text>
            </View>
          )}

          {/* EDITOR TOGGLE */}
          {!showEditor && (
            <Pressable
              onPress={() => setShowEditor(true)}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {hasCurrentBudget
                  ? 'Edit Monthly Budget'
                  : 'Set Monthly Budget'}
              </Text>
            </Pressable>
          )}

          {/* BUDGET EDITOR */}
          {showEditor && (
            <View
              style={[
                styles.editorCard,
                { backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                {hasCurrentBudget
                  ? 'Update Budget'
                  : 'Create Budget'}
              </Text>

              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.text },
                ]}
              >
                Total Monthly Limit (₹)
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={totalLimit}
                onChangeText={setTotalLimit}
                keyboardType="numeric"
                placeholder="Enter monthly budget"
                placeholderTextColor={colors.secondaryText}
              />

              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.text },
                ]}
              >
                Category Budgets
              </Text>

              {categoryRows.map((item, index) => (
                <View
                  key={index}
                  style={styles.categoryInputRow}
                >
                  <TextInput
                    style={[
                      styles.input,
                      styles.categoryInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                    value={item.category}
                    onChangeText={(value) =>
                      updateCategoryRow(index, 'category', value)
                    }
                    placeholder="Category"
                    placeholderTextColor={colors.secondaryText}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      styles.limitInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                    value={item.limit}
                    onChangeText={(value) =>
                      updateCategoryRow(index, 'limit', value)
                    }
                    keyboardType="numeric"
                    placeholder="Limit ₹"
                    placeholderTextColor={colors.secondaryText}
                  />

                  <Pressable
                    onPress={() => removeCategoryRow(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={addCategoryRow}
                style={styles.addCategoryButton}
              >
                <Text
                  style={[
                    styles.addCategoryText,
                    { color: colors.primary },
                  ]}
                >
                  + Add Category
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveBudget}
                disabled={budgetLoading}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
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
                <Text
                  style={[
                    styles.cancelText,
                    { color: colors.secondaryText },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
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
    marginBottom: 25,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    fontSize: 28,
    lineHeight: 32,
  },

  monthText: {
    fontSize: 17,
    fontWeight: '700',
  },

  overviewCard: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 28,
  },

  cardLabel: {
    fontSize: 14,
  },

  totalLimit: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },

  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 22,
  },

  smallLabel: {
    fontSize: 12,
  },

  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },

  progressBackground: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 10,
    borderRadius: 10,
  },

  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  progressText: {
    fontSize: 11,
  },

  warningText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
  },

  categoryCard: {
    padding: 17,
    borderRadius: 15,
    marginBottom: 13,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },

  categoryPercentage: {
    fontSize: 13,
    fontWeight: '700',
  },

  categoryAmount: {
    fontSize: 12,
    marginTop: 9,
  },

  remainingText: {
    fontSize: 11,
    marginTop: 9,
  },

  emptyCard: {
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
  },

  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 20,
  },

  editorCard: {
    padding: 18,
    borderRadius: 16,
    marginTop: 22,
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 17,
    marginBottom: 9,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 14,
  },

  categoryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 7,
  },

  categoryInput: {
    flex: 1.2,
  },

  limitInput: {
    flex: 1,
  },

  removeButton: {
    width: 30,
    alignItems: 'center',
  },

  removeText: {
    color: '#EF4444',
    fontSize: 25,
  },

  addCategoryButton: {
    marginTop: 8,
    marginBottom: 18,
  },

  addCategoryText: {
    fontSize: 13,
    fontWeight: '700',
  },

  primaryButton: {
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 18,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  cancelButton: {
    alignItems: 'center',
    padding: 13,
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },

  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
});
