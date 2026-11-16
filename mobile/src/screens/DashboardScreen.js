
import React from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';

export default function DashboardScreen({ navigation }) {
  const {
    transactions = [],
    totalExpenses = 0,
    loading,
  } = useExpenses();

  const { theme } = useTheme();
  const colors = theme.colors;
  const isDark = theme.mode === 'dark';

  const styles = createStyles(colors, isDark);

  const safeTotal = Number(totalExpenses) || 0;

  const averageExpense =
    transactions.length > 0
      ? safeTotal / transactions.length
      : 0;

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.dateText}>
              {formattedDate.toUpperCase()}
            </Text>

            <Text style={styles.greeting}>
              {greeting()} 👋
            </Text>

            <Text style={styles.subtitle}>
              Here's your spending overview.
            </Text>
          </View>

          <View style={styles.profile}>
            <Text style={styles.profileText}>U</Text>
          </View>
        </View>

        {/* TOTAL EXPENSE CARD */}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.cardLabel}>
                TOTAL EXPENSES
              </Text>

              <Text style={styles.total}>
                ₹{formatCurrency(safeTotal)}
              </Text>

              <Text style={styles.cardSubtitle}>
                Your total recorded spending
              </Text>
            </View>

            <View style={styles.balanceIcon}>
              <Text style={styles.balanceIconText}>₹</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>
                TRANSACTIONS
              </Text>

              <Text style={styles.footerValue}>
                {transactions.length} records
              </Text>
            </View>

            <View style={styles.footerBadge}>
              <Text style={styles.footerBadgeText}>
                ExpenseFlow
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK SUMMARY */}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            Your overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            A quick look at your expenses
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          {/* TOTAL RECORDS */}

          <View style={styles.summaryCard}>
            <View style={styles.recordsIcon}>
              <Text style={styles.summaryIconText}>↗</Text>
            </View>

            <Text style={styles.summaryLabel}>
              Total Records
            </Text>

            <Text style={styles.summaryValue}>
              {transactions.length}
            </Text>

            <Text style={styles.summaryHint}>
              Expenses tracked
            </Text>
          </View>

          {/* AVERAGE EXPENSE */}

          <View style={styles.summaryCard}>
            <View style={styles.averageIcon}>
              <Text style={styles.summaryIconText}>₹</Text>
            </View>

            <Text style={styles.summaryLabel}>
              Average Expense
            </Text>

            <Text style={styles.summaryValue}>
              ₹{Math.round(averageExpense).toLocaleString('en-IN')}
            </Text>

            <Text style={styles.summaryHint}>
              Per transaction
            </Text>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent transactions
            </Text>

            <Text style={styles.sectionSubtitle}>
              Keep track of your spending
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Transactions')}
            hitSlop={10}
          >
            <Text style={styles.seeAll}>
              See all →
            </Text>
          </Pressable>
        </View>

        {/* LOADING STATE */}

        {loading && transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text style={styles.emptySubtitle}>
              Loading your transactions...
            </Text>
          </View>
        ) : transactions.length === 0 ? (

          /* EMPTY STATE */

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>💸</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No expenses yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Start tracking your spending and take control
              of your finances.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Text style={styles.emptyButtonText}>
                Add your first expense
              </Text>
            </Pressable>
          </View>

        ) : (

          /* TRANSACTION LIST */

          <View style={styles.transactionList}>
            {transactions.slice(0, 5).map((item) => (
              <TransactionItem
                key={item.id}
                item={item}
              />
            ))}
          </View>
        )}

        {/* ADD EXPENSE BUTTON */}

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonIcon}>＋</Text>

          <Text style={styles.addButtonText}>
            Add Expense
          </Text>
        </Pressable>

        {/* FOOTER */}

        <Text style={styles.footer}>
          Manage your money smarter. ✨
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },

    headerText: {
      flex: 1,
    },

    dateText: {
      color: colors.secondaryText,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 9,
    },

    greeting: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '800',
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 7,
    },

    profile: {
      width: 48,
      height: 48,
      borderRadius: 17,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },

    profileText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
    },

    // TOTAL EXPENSE CARD

    balanceCard: {
      backgroundColor: colors.primary,
      padding: 23,
      borderRadius: 25,
      marginBottom: 29,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },

    balanceTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    cardLabel: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
    },

    total: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '800',
      marginTop: 15,
    },

    cardSubtitle: {
      color: '#FFFFFF',
      fontSize: 12,
      opacity: 0.85,
      marginTop: 8,
    },

    balanceIcon: {
      width: 48,
      height: 48,
      borderRadius: 17,
      backgroundColor: '#FFFFFF25',
      justifyContent: 'center',
      alignItems: 'center',
    },

    balanceIconText: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '800',
    },

    cardDivider: {
      height: 1,
      backgroundColor: '#FFFFFF45',
      marginTop: 23,
      marginBottom: 16,
    },

    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    footerLabel: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1,
      opacity: 0.8,
    },

    footerValue: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      marginTop: 5,
    },

    footerBadge: {
      backgroundColor: '#FFFFFF25',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
    },

    footerBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },

    // SECTION HEADINGS

    sectionHeading: {
      marginBottom: 16,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },

    sectionSubtitle: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 5,
    },

    // SUMMARY CARDS

    summaryContainer: {
      flexDirection: 'row',
      marginBottom: 30,
    },

    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      minHeight: 155,
    },

    recordsIcon: {
      width: 37,
      height: 37,
      borderRadius: 13,
      backgroundColor: isDark ? '#254337' : '#E4F7EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 13,
    },

    averageIcon: {
      width: 37,
      height: 37,
      borderRadius: 13,
      backgroundColor: isDark ? '#382C56' : '#F0E9FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 13,
    },

    summaryIconText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '800',
    },

    summaryLabel: {
      color: colors.secondaryText,
      fontSize: 11,
      fontWeight: '600',
    },

    summaryValue: {
      color: colors.text,
      fontSize: 21,
      fontWeight: '800',
      marginTop: 8,
    },

    summaryHint: {
      color: colors.secondaryText,
      fontSize: 10,
      marginTop: 5,
    },

    // TRANSACTIONS

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 17,
    },

    seeAll: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },

    transactionList: {
      marginBottom: 8,
    },

    // EMPTY STATE

    emptyState: {
      backgroundColor: colors.card,
      padding: 25,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 15,
    },

    emptyIcon: {
      width: 65,
      height: 65,
      borderRadius: 22,
      backgroundColor: isDark ? '#382C56' : '#F0E9FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },

    emptyEmoji: {
      fontSize: 30,
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 8,
    },

    emptySubtitle: {
      color: colors.secondaryText,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 10,
    },

    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 18,
    },

    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },

    // ADD EXPENSE BUTTON

    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 17,
      paddingVertical: 17,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 17,
      elevation: 3,
    },

    addButtonIcon: {
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '700',
      marginRight: 8,
    },

    addButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    // FOOTER

    footer: {
      color: colors.secondaryText,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 25,
      marginBottom: 5,
    },
  });
