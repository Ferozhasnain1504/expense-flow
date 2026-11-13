
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
  const { transactions, totalExpenses } = useExpenses();

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.heading}>My Expenses 👋</Text>

      <Text style={styles.subtitle}>
        Your spending overview
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Expenses</Text>

        <Text style={styles.total}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Transactions
        </Text>

        <Text style={styles.count}>
          {transactions.length} records
        </Text>
      </View>

      {transactions.map((item) => (
        <View key={item.id} style={styles.transaction}>
          <View style={{ flex: 1 }}>
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
      ))}

      <Pressable
        style={styles.button}
        onPress={onAddExpense}
      >
        <Text style={styles.buttonText}>
          + Add Expense
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B1020',
    padding: 22,
    paddingTop: 55,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#5141B8',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
  },

  cardLabel: {
    color: '#DDD6FE',
  },

  total: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  count: {
    color: '#94A3B8',
  },

  transaction: {
    backgroundColor: '#19243B',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  category: {
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 12,
  },

  amount: {
    color: '#F87171',
    fontWeight: '800',
  },

  button: {
    backgroundColor: '#6D4AFF',
    padding: 19,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
