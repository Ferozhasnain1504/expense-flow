import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen() {
  const { transactions, totalExpenses } = useExpenses();

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories from the existing transactions.
  const categories = [
    'All',
    ...new Set(transactions.map((item) => item.category)),
  ];

  // Show only transactions belonging to the selected category.
  const filteredTransactions =
    selectedCategory === 'All'
      ? transactions
      : transactions.filter(
          (item) => item.category === selectedCategory
        );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Transactions</Text>
        <Text style={styles.subtitle}>
          Track where your money goes
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>

        <Text style={styles.summaryAmount}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>

        <Text style={styles.transactionCount}>
          {transactions.length} transactions recorded
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>

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
                isSelected && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.activeFilterText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.transactionHeader}>
        <Text style={styles.sectionTitle}>All Transactions</Text>
        <Text style={styles.resultCount}>
          {filteredTransactions.length} results
        </Text>
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            No transactions found
          </Text>

          <Text style={styles.emptySubtitle}>
            Add an expense in this category to see it here.
          </Text>
        </View>
      ) : (
        filteredTransactions.map((item) => (
          <TransactionItem key={item.id} item={item} />
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
    marginBottom: 28,
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
  },
  activeFilter: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    color: '#A0A5B5',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
  emptyState: {
    padding: 30,
    alignItems: 'center',
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