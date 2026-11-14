
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ navigation }) {
  const {
    transactions,
    totalExpenses,
    deleteExpense,
  } = useExpenses();

  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    ...new Set(transactions.map((item) => item.category)),
  ];

  const filteredTransactions =
    selectedCategory === 'All'
      ? transactions
      : transactions.filter(
          (item) => item.category === selectedCategory
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
            No transactions found
          </Text>

          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.secondaryText },
            ]}
          >
            Add an expense in this category to see it here.
          </Text>
        </View>
      ) : (
        filteredTransactions.map((item) => (
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
    backgroundColor: '#0B1020',
    padding: 20,
  },

  header: {
    marginTop: 45,
    marginBottom: 24,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#9298AA',
    fontSize: 14,
    marginTop: 6,
  },

  summaryCard: {
    backgroundColor: '#191F35',
    padding: 22,
    borderRadius: 18,
    marginBottom: 15,
  },

  summaryLabel: {
    color: '#A0A5B5',
    fontSize: 14,
  },

  summaryAmount: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  filterContainer: {
    marginTop: 15,
    marginBottom: 25,
    flexGrow: 0,
  },

  filterButton: {
    backgroundColor: '#191F35',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },

  filterText: {
    color: '#A0A5B5',
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
    color: '#9298AA',
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
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  emptySubtitle: {
    color: '#9298AA',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
