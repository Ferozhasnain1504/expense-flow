
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';

const DATE_FILTERS = [
  'All time',
  'Today',
  'This week',
  'This month',
];

const SORT_OPTIONS = [
  'Newest first',
  'Oldest first',
  'Highest amount',
  'Lowest amount',
];

function isWithinDateFilter(dateValue, filter) {
  if (filter === 'All time') return true;

  const expenseDate = new Date(dateValue);

  if (Number.isNaN(expenseDate.getTime())) return false;

  const now = new Date();

  if (filter === 'Today') {
    return (
      expenseDate.getFullYear() === now.getFullYear() &&
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getDate() === now.getDate()
    );
  }

  if (filter === 'This week') {
    const startOfWeek = new Date(now);
    const daysSinceMonday = (now.getDay() + 6) % 7;

    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return expenseDate >= startOfWeek && expenseDate < endOfWeek;
  }

  if (filter === 'This month') {
    return (
      expenseDate.getFullYear() === now.getFullYear() &&
      expenseDate.getMonth() === now.getMonth()
    );
  }

  return true;
}

export default function TransactionsScreen({ navigation }) {
  const {
    transactions = [],
    totalExpenses = 0,
    deleteExpense,
  } = useExpenses();

  const { theme } = useTheme();
  const colors = theme.colors;
  const isDark = theme.mode === 'dark';

  const styles = createStyles(colors, isDark);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] =
    useState('All time');
  const [selectedSort, setSelectedSort] = useState('Newest first');

  const categories = [
    'All',
    ...new Set(
      transactions
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  // SEARCH, CATEGORY AND DATE FILTERS

  const filteredTransactions = transactions.filter((item) => {
    const title = String(item.title || '').toLowerCase();

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    const matchesSearch = title.includes(
      searchQuery.trim().toLowerCase()
    );

    const matchesDate = isWithinDateFilter(
      item.date,
      selectedDateFilter
    );

    return matchesCategory && matchesSearch && matchesDate;
  });

  // SORT TRANSACTIONS

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => {
      if (selectedSort === 'Newest first') {
        return new Date(b.date) - new Date(a.date);
      }

      if (selectedSort === 'Oldest first') {
        return new Date(a.date) - new Date(b.date);
      }

      if (selectedSort === 'Highest amount') {
        return Number(b.amount) - Number(a.amount);
      }

      if (selectedSort === 'Lowest amount') {
        return Number(a.amount) - Number(b.amount);
      }

      return 0;
    }
  );

  // DELETE EXPENSE

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);

              Alert.alert(
                'Deleted',
                'Expense deleted successfully.'
              );
            } catch (error) {
              console.log(
                'Delete expense error:',
                error.response?.data || error.message
              );

              Alert.alert(
                'Delete failed',
                error.response?.data?.message ||
                  'Could not delete this expense. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategory !== 'All' ||
    selectedDateFilter !== 'All time';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDateFilter('All time');
    setSelectedSort('Newest first');
  };

  // FILTER CHIP

  const renderFilter = (label, selected, onPress) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[
        styles.filterButton,
        selected && styles.selectedFilter,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          selected && styles.selectedFilterText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            YOUR FINANCES
          </Text>

          <Text style={styles.heading}>
            Transactions
          </Text>

          <Text style={styles.subtitle}>
            Every expense, all in one place.
          </Text>
        </View>

        {/* SUMMARY CARD */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>
                TOTAL RECORDED EXPENSES
              </Text>

              <Text style={styles.summaryAmount}>
                ₹{formatCurrency(totalExpenses)}
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>₹</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryFooter}>
            <Text style={styles.summaryFooterText}>
              {transactions.length} transactions recorded
            </Text>

            <Text style={styles.summaryFooterText}>
              All time
            </Text>
          </View>
        </View>

        {/* ADD EXPENSE */}

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonIcon}>＋</Text>

          <Text style={styles.addButtonText}>
            Add New Expense
          </Text>
        </Pressable>

        {/* SEARCH */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Find a transaction
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by expense title..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* DATE FILTERS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Date range
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {DATE_FILTERS.map((filter) =>
            renderFilter(
              filter,
              selectedDateFilter === filter,
              () => setSelectedDateFilter(filter)
            )
          )}
        </ScrollView>

        {/* CATEGORY FILTERS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Categories
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {categories.map((category) =>
            renderFilter(
              category,
              selectedCategory === category,
              () => setSelectedCategory(category)
            )
          )}
        </ScrollView>

        {/* SORTING */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Sort transactions
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {SORT_OPTIONS.map((option) =>
            renderFilter(
              option,
              selectedSort === option,
              () => setSelectedSort(option)
            )
          )}
        </ScrollView>

        {/* TRANSACTION LIST HEADER */}

        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              All transactions
            </Text>

            <Text style={styles.resultCount}>
              Showing {filteredTransactions.length} of {transactions.length}
            </Text>
          </View>

          {hasActiveFilters && (
            <Pressable onPress={clearFilters}>
              <Text style={styles.clearFilters}>
                Reset filters
              </Text>
            </Pressable>
          )}
        </View>

        {/* TRANSACTION LIST */}

        {sortedTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>🔎</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No matching expenses
            </Text>

            <Text style={styles.emptySubtitle}>
              Try changing your search, category or date filter.
            </Text>

            {hasActiveFilters && (
              <Pressable
                style={styles.resetButton}
                onPress={clearFilters}
              >
                <Text style={styles.resetButtonText}>
                  Clear all filters
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          sortedTransactions.map((item) => (
            <View key={item.id} style={styles.transactionWrapper}>
              <Pressable
                style={styles.transactionContent}
                onPress={() =>
                  navigation.navigate('EditExpense', {
                    expense: item,
                  })
                }
              >
                <TransactionItem item={item} />
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  handleDelete(item.id, item.title)
                }
              >
                <Text style={styles.deleteText}>
                  Delete expense
                </Text>
              </Pressable>
            </View>
          ))
        )}

        {/* FOOTER */}

        <Text style={styles.footer}>
          Stay aware. Spend wisely. ✨
        </Text>
      </ScrollView>
    </View>
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
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 35,
    },

    // HEADER

    header: {
      marginBottom: 25,
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
      fontSize: 29,
      fontWeight: '800',
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 7,
    },

    // SUMMARY

    summaryCard: {
      backgroundColor: colors.primary,
      padding: 22,
      borderRadius: 23,
      marginBottom: 17,
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 9,
    },

    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    summaryLabel: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },

    summaryAmount: {
      color: '#FFFFFF',
      fontSize: 29,
      fontWeight: '800',
      marginTop: 12,
    },

    summaryIcon: {
      width: 47,
      height: 47,
      borderRadius: 16,
      backgroundColor: '#FFFFFF30',
      justifyContent: 'center',
      alignItems: 'center',
    },

    summaryIconText: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '800',
    },

    summaryDivider: {
      height: 1,
      backgroundColor: '#FFFFFF40',
      marginTop: 20,
      marginBottom: 14,
    },

    summaryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    summaryFooterText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },

    // ADD BUTTON

    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 29,
    },

    addButtonIcon: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
      marginRight: 7,
    },

    addButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    // SECTION HEADERS

    sectionHeader: {
      marginBottom: 11,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },

    // SEARCH

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 15,
      paddingHorizontal: 14,
      height: 53,
      marginBottom: 25,
    },

    searchIcon: {
      color: colors.secondaryText,
      fontSize: 25,
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      height: '100%',
    },

    clearSearch: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
      paddingLeft: 8,
    },

    // FILTERS

    filterContainer: {
      marginBottom: 24,
      flexGrow: 0,
    },

    filterButton: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 9,
    },

    selectedFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    filterText: {
      color: colors.secondaryText,
      fontSize: 12,
      fontWeight: '600',
    },

    selectedFilterText: {
      color: '#FFFFFF',
    },

    // TRANSACTION LIST

    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 17,
    },

    resultCount: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 5,
    },

    clearFilters: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '700',
    },

    transactionWrapper: {
      backgroundColor: colors.card,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      marginBottom: 12,
    },

    transactionContent: {
      marginBottom: 7,
    },

    deleteButton: {
      alignSelf: 'flex-end',
      backgroundColor: isDark ? '#351D2A' : '#FEE2E2',
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 9,
    },

    deleteText: {
      color: colors.danger,
      fontSize: 11,
      fontWeight: '700',
    },

    // EMPTY STATE

    emptyState: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 27,
      alignItems: 'center',
      marginBottom: 15,
    },

    emptyIcon: {
      width: 62,
      height: 62,
      borderRadius: 21,
      backgroundColor: isDark ? '#382C56' : '#F0E9FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },

    emptyEmoji: {
      fontSize: 27,
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },

    emptySubtitle: {
      color: colors.secondaryText,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 9,
    },

    resetButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 11,
      marginTop: 17,
    },

    resetButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },

    // FOOTER

    footer: {
      color: colors.secondaryText,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 25,
    },
  });
