
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';

import {
  requestNotificationPermissions,
  scheduleBillReminder,
} from '../services/notificationService';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';

export default function DashboardScreen({ navigation }) {
  const { transactions, totalExpenses } = useExpenses();
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleTestNotification = async () => {
  try {
    const permissionGranted =
      await requestNotificationPermissions();

    if (!permissionGranted) {
      Alert.alert(
        'Permission Required',
        'Please allow notifications in Android settings.'
      );
      return;
    }

    await scheduleBillReminder({
      title: 'ExpenseFlow Test',
      body: 'Your notifications are working successfully!',
      date: new Date(Date.now() + 5000),
      data: { type: 'test' },
    });

    Alert.alert(
      'Success',
      'Notification scheduled! Check your phone in 5 seconds.'
    );
  } catch (error) {
    console.error('Notification error:', error);
    Alert.alert('Error', error.message);
  }
};

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={
          theme.mode === 'dark' ? 'light-content' : 'dark-content'
        }
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

      <Pressable
  onPress={handleTestNotification}
  style={{
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  }}
>
  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
    🔔 Test Local Notification
  </Text>
</Pressable>
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning 👋
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.secondaryText },
              ]}
            >
              Here's your spending overview.
            </Text>
          </View>

          <View style={styles.profile}>
            <Text style={styles.profileText}>U</Text>
          </View>
        </View>

        {/* TOTAL EXPENSE CARD */}

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.cardLabel}>TOTAL EXPENSES</Text>

          <Text style={styles.total}>
            ₹
            {totalExpenses.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <Text style={styles.cardSubtitle}>
            Your total recorded spending
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerLabel}>
              {transactions.length} transactions
            </Text>

            <Text style={styles.footerIcon}>↗</Text>
          </View>
        </View>

        {/* QUICK SUMMARY */}

        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconGreen}>
              <Text style={styles.iconText}>↗</Text>
            </View>

            <Text
              style={[
                styles.summaryLabel,
                { color: colors.secondaryText },
              ]}
            >
              Total Records
            </Text>

            <Text
              style={[
                styles.summaryValue,
                { color: colors.text },
              ]}
            >
              {transactions.length}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconPurple}>
              <Text style={styles.iconText}>₹</Text>
            </View>

            <Text
              style={[
                styles.summaryLabel,
                { color: colors.secondaryText },
              ]}
            >
              Average Expense
            </Text>

            <Text
              style={[
                styles.summaryValue,
                { color: colors.text },
              ]}
            >
              ₹
              {transactions.length > 0
                ? Math.round(
                    totalExpenses / transactions.length
                  ).toLocaleString('en-IN')
                : '0'}
            </Text>
          </View>
        </View>

        {/* TRANSACTION SECTION */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              Recent Transactions
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: colors.secondaryText },
              ]}
            >
              Keep track of your spending
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        </View>

        {/* TRANSACTION LIST */}

        {transactions.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={styles.emptyEmoji}>💸</Text>

            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text },
              ]}
            >
              No expenses yet
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.secondaryText },
              ]}
            >
              Start tracking your spending today.
            </Text>
          </View>
        ) : (
          transactions.slice(0, 5).map((item) => (
            <TransactionItem key={item.id} item={item} />
          ))
        )}

        {/* ADD EXPENSE BUTTON */}

        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonText}>
            + Add Expense
          </Text>
        </Pressable>

        {/* FOOTER */}

        <Text
          style={[
            styles.footer,
            { color: colors.secondaryText },
          ]}
        >
          Manage your money smarter.
        </Text>
      </ScrollView>
    </View>
  );
}

// STYLES

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

  // HEADER

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 7,
  },

  profile: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#5141B8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  // BALANCE CARD

  balanceCard: {
    backgroundColor: '#5141B8',
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
  },

  cardLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  total: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 15,
  },

  cardSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF30',
    marginTop: 22,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  footerIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  // SUMMARY CARDS

  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#19243B',
    padding: 17,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#27334C',
  },

  summaryIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#22C55E25',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  summaryIconPurple: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#8B5CF625',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  iconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },

  // TRANSACTIONS

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

  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  seeAll: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
  },

  // EMPTY STATE

  emptyState: {
    backgroundColor: '#19243B',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyEmoji: {
    fontSize: 40,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },

  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  // ADD BUTTON

  addButton: {
    backgroundColor: '#6D4AFF',
    padding: 19,
    borderRadius: 17,
    alignItems: 'center',
    marginTop: 18,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // FOOTER

  footer: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 25,
  },
});
