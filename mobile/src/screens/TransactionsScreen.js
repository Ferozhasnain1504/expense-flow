
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
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
    const day = now.getDay();
    const daysSinceMonday = (day + 6) % 7;

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
    transactions,
    totalExpenses,
    deleteExpense,
  } = useExpenses();

  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] =
    useState('All time');

  const [selectedSort, setSelectedSort] = useState('Newest first');

  const SORT_OPTIONS = [
    'Newest first',
    'Oldest first',
    'Highest amount',
    'Lowest amount',
  ];

  

  const categories = [
    'All',
    ...new Set(transactions.map((item) => item.category)),
  ];

  // Combine search, category and date filters
  const filteredTransactions = transactions.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    const matchesDate = isWithinDateFilter(
      item.date,
      selectedDateFilter
    );

    return matchesCategory && matchesSearch && matchesDate;
  });

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

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Transactions
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.secondaryText },
          ]}
        >
          Track where your money goes
        </Text>
      </View>

      {/* SUMMARY CARD */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.card },
        ]}
      >
        <Text
          style={[
            styles.summaryLabel,
            { color: colors.secondaryText },
          ]}
        >
          Total Expenses
        </Text>

        <Text style={[styles.summaryAmount, { color: colors.text }]}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>

        <Text style={styles.transactionCount}>
          {transactions.length} transactions recorded
        </Text>
      </View>

      {/* ADD EXPENSE */}
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={styles.addButtonText}>
          + Add Expense
        </Text>
      </Pressable>

      {/* SEARCH BAR */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Search Expenses
      </Text>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text },
          ]}
          placeholder="Search by expense title..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text
              style={[
                styles.clearSearch,
                { color: colors.primary },
              ]}
            >
              Clear
            </Text>
          </Pressable>
        )}
      </View>

      {/* DATE FILTERS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Filter by Date
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {DATE_FILTERS.map((filter) => {
          const isSelected = selectedDateFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedDateFilter(filter)}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : colors.secondaryText,
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CATEGORY FILTERS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Categories
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : colors.secondaryText,
                  },
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* SORTING OPTIONS */}
<Text style={[styles.sectionTitle, { color: colors.text }]}>
  Sort By
</Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.filterContainer}
>
  {SORT_OPTIONS.map((option) => {
    const isSelected = selectedSort === option;

    return (
      <Pressable
        key={option}
        onPress={() => setSelectedSort(option)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isSelected
              ? colors.primary
              : colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            {
              color: isSelected
                ? '#FFFFFF'
                : colors.secondaryText,
            },
          ]}
        >
          {option}
        </Text>
      </Pressable>
    );
  })}
</ScrollView>

      {/* TRANSACTION LIST */}
      <View style={styles.transactionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Transactions
        </Text>

        <Text
          style={[
            styles.resultCount,
            { color: colors.secondaryText },
          ]}
        >
          {filteredTransactions.length} results
        </Text>
      </View>

      {filteredTransactions.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No matching expenses
          </Text>

          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.secondaryText },
            ]}
          >
            Try changing your search, category or date filter.
          </Text>
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
              onPress={() => handleDelete(item.id, item.title)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginTop: 45,
    marginBottom: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },

  summaryCard: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 15,
  },

  summaryLabel: {
    fontSize: 14,
  },

  summaryAmount: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },

  transactionCount: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 8,
  },

  addButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 25,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 25,
    height: 52,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  clearSearch: {
    fontSize: 12,
    fontWeight: '700',
    paddingLeft: 8,
  },

  filterContainer: {
    marginTop: 15,
    marginBottom: 25,
    flexGrow: 0,
  },

  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  resultCount: {
    fontSize: 12,
  },

  transactionWrapper: {
    marginBottom: 12,
  },

  transactionContent: {
    marginBottom: 6,
  },

  deleteButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#351D2A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deleteText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyState: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },

  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
