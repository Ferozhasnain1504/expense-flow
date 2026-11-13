
import React from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';

export default function DashboardScreen({ onAddExpense }) {

  // Get shared expense data
  const { transactions, totalExpenses } = useExpenses();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}

      <Text style={styles.greeting}>
        Good evening 👋
      </Text>

      <Text style={styles.subtitle}>
        Here's your spending overview.
      </Text>

      {/* Total Expenses Card */}

      <View style={styles.balanceCard}>
        <Text style={styles.cardLabel}>
          TOTAL EXPENSES
        </Text>

        <Text style={styles.total}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>

        <Text style={styles.cardSubtitle}>
          Your total recorded spending
        </Text>
      </View>

      {/* Transaction Header */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recent Transactions
        </Text>

        <Text style={styles.count}>
          {transactions.length} records
        </Text>
      </View>

      {/* Transaction List */}

      {transactions.length === 0 ? (

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💸</Text>

          <Text style={styles.emptyTitle}>
            No expenses yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Start tracking your spending today.
          </Text>
        </View>

      ) : (

        transactions.map((item) => (
          <View
            key={item.id}
            style={styles.transaction}
          >
            <View style={styles.transactionIcon}>
              <Text style={styles.iconText}>
                {item.category === 'Food' ? '🍔' :
                 item.category === 'Transport' ? '🚕' :
                 item.category === 'Shopping' ? '🛍️' :
                 item.category === 'Entertainment' ? '🎬' :
                 item.category === 'Bills' ? '🧾' : '💰'}
              </Text>
            </View>

            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>
                {item.title}
              </Text>

              <Text style={styles.category}>
                {item.category} · {item.date}
              </Text>
            </View>

            <Text style={styles.amount}>
              - ₹{item.amount.toLocaleString('en-IN')}
            </Text>
          </View>
        ))

      )}

      {/* Add Expense Button */}

      <Pressable
        style={styles.button}
        onPress={onAddExpense}
      >
        <Text style={styles.buttonText}>
          + Add New Expense
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
  },

  container: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 28,
  },

  balanceCard: {
    backgroundColor: '#5141B8',
    padding: 25,
    borderRadius: 22,
    marginBottom: 30,
  },

  cardLabel: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  total: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    marginTop: 15,
  },

  cardSubtitle: {
    color: '#DDD6FE',
    fontSize: 12,
    marginTop: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  count: {
    color: '#94A3B8',
    fontSize: 12,
  },

  transaction: {
    backgroundColor: '#19243B',
    padding: 16,
    borderRadius: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#27334C',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 21,
  },

  transactionDetails: {
    flex: 1,
    marginLeft: 13,
  },

  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  category: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  amount: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyState: {
    backgroundColor: '#19243B',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 40,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
    marginTop: 12,
  },

  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#6D4AFF',
    padding: 19,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});
