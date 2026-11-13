
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';

const transactions = [
  {
    id: '1',
    title: 'Groceries',
    category: 'Food & Drinks',
    amount: '-₹850',
    icon: '🛒',
    time: 'Today, 10:30 AM',
    color: '#F59E0B',
  },
  {
    id: '2',
    title: 'Uber Ride',
    category: 'Transportation',
    amount: '-₹250',
    icon: '🚕',
    time: 'Today, 9:15 AM',
    color: '#6366F1',
  },
  {
    id: '3',
    title: 'Shopping',
    category: 'Shopping',
    amount: '-₹1,500',
    icon: '🛍️',
    time: 'Yesterday',
    color: '#EC4899',
  },
  {
    id: '4',
    title: 'Netflix',
    category: 'Entertainment',
    amount: '-₹649',
    icon: '🎬',
    time: 'Yesterday',
    color: '#EF4444',
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const theme = darkMode
    ? {
        background: '#0B1020',
        surface: '#151D32',
        card: '#19243B',
        text: '#F8FAFC',
        secondary: '#94A3B8',
        border: '#27334C',
        accent: '#8B5CF6',
        input: '#202B43',
      }
    : {
        background: '#F5F6FC',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        text: '#172033',
        secondary: '#64748B',
        border: '#E7EAF2',
        accent: '#6D4AFF',
        input: '#F1F2F8',
      };

  const styles = createStyles(theme);

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >

          {/* HEADER */}

          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good evening </Text>
              <Text style={styles.username}>Welcome back, User</Text>
            </View>

            <Pressable
              style={styles.themeButton}
              onPress={() => setDarkMode(!darkMode)}
            >
              <Text style={styles.themeIcon}>
                {darkMode ? '☀️' : '🌙'}
              </Text>
            </Pressable>
          </View>

          {/* BALANCE CARD */}

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>
              TOTAL BALANCE
            </Text>

            <Text style={styles.balance}>
              ₹25,000.00
            </Text>

            <View style={styles.balanceFooter}>
              <View>
                <Text style={styles.balanceSmall}>
                  Monthly spending
                </Text>
                <Text style={styles.balanceAmount}>
                  ₹15,000
                </Text>
              </View>

              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>
                  ↘ 12.5%
                </Text>
              </View>
            </View>
          </View>

          {/* INCOME / EXPENSE */}

          <View style={styles.summaryContainer}>

            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <Text style={styles.summaryIcon}>↗</Text>
                <Text style={styles.summaryLabel}>Income</Text>
              </View>

              <Text style={styles.income}>₹40,000</Text>
              <Text style={styles.summaryHint}>This month</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <Text style={styles.expenseIcon}>↘</Text>
                <Text style={styles.summaryLabel}>Expenses</Text>
              </View>

              <Text style={styles.expense}>₹15,000</Text>
              <Text style={styles.summaryHint}>This month</Text>
            </View>

          </View>

          {/* SPENDING PROGRESS */}

          <View style={styles.progressCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Monthly Budget
              </Text>

              <Text style={styles.progressPercent}>
                60%
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.summaryHint}>
              ₹15,000 spent out of ₹25,000
            </Text>
          </View>

          {/* TRANSACTIONS */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Transactions
            </Text>

            <Pressable onPress={() => alert('All transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {transactions.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [index * 5, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.transaction}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: item.color + '22' },
                  ]}
                >
                  <Text style={styles.iconText}>
                    {item.icon}
                  </Text>
                </View>

                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>
                    {item.title}
                  </Text>

                  <Text style={styles.transactionCategory}>
                    {item.category} · {item.time}
                  </Text>
                </View>

                <Text style={styles.transactionAmount}>
                  {item.amount}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* ADD EXPENSE BUTTON */}

          <Animated.View
            style={{ transform: [{ scale: buttonScale }] }}
          >
            <Pressable
              style={styles.addButton}
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={() => alert('Add Expense Screen coming next!')}
            >
              <Text style={styles.addButtonText}>
                + Add New Expense
              </Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.footer}>
            Made with care · Expense Tracker
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({

    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    container: {
      paddingHorizontal: 22,
      paddingTop: 55,
      paddingBottom: 30,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },

    greeting: {
      fontSize: 25,
      fontWeight: '800',
      color: theme.text,
    },

    username: {
      color: theme.secondary,
      fontSize: 14,
      marginTop: 5,
    },

    themeButton: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    themeIcon: {
      fontSize: 21,
    },

    balanceCard: {
      backgroundColor: '#5141B8',
      padding: 25,
      borderRadius: 25,
      marginBottom: 20,
    },

    balanceLabel: {
      color: '#DCD6FF',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.5,
    },

    balance: {
      color: '#FFFFFF',
      fontSize: 35,
      fontWeight: '800',
      marginTop: 12,
      marginBottom: 25,
    },

    balanceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    balanceSmall: {
      color: '#DCD6FF',
      fontSize: 12,
    },

    balanceAmount: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '700',
      marginTop: 5,
    },

    percentageBadge: {
      backgroundColor: '#FFFFFF25',
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 12,
    },

    percentageText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    summaryContainer: {
      flexDirection: 'row',
      marginBottom: 18,
    },

    summaryCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 17,
      borderWidth: 1,
      borderColor: theme.border,
      marginHorizontal: 5,
    },

    summaryTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    summaryIcon: {
      color: '#22C55E',
      fontSize: 20,
      marginRight: 8,
    },

    expenseIcon: {
      color: '#F87171',
      fontSize: 20,
      marginRight: 8,
    },

    summaryLabel: {
      color: theme.secondary,
      fontSize: 13,
      fontWeight: '600',
    },

    income: {
      color: '#22C55E',
      fontSize: 19,
      fontWeight: '800',
      marginTop: 14,
    },

    expense: {
      color: '#F87171',
      fontSize: 19,
      fontWeight: '800',
      marginTop: 14,
    },

    summaryHint: {
      color: theme.secondary,
      fontSize: 11,
      marginTop: 7,
    },

    progressCard: {
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 28,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },

    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },

    progressPercent: {
      color: theme.accent,
      fontWeight: '800',
      fontSize: 15,
    },

    progressBackground: {
      height: 9,
      backgroundColor: theme.input,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 8,
    },

    progressFill: {
      height: '100%',
      width: '60%',
      backgroundColor: '#8B5CF6',
      borderRadius: 20,
    },

    seeAll: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: '700',
    },

    transaction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      padding: 15,
      borderRadius: 17,
      marginBottom: 11,
      borderWidth: 1,
      borderColor: theme.border,
    },

    transactionIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },

    iconText: {
      fontSize: 21,
    },

    transactionDetails: {
      flex: 1,
      marginLeft: 13,
    },

    transactionName: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 14,
    },

    transactionCategory: {
      color: theme.secondary,
      fontSize: 10,
      marginTop: 5,
    },

    transactionAmount: {
      color: theme.text,
      fontWeight: '800',
      fontSize: 14,
    },

    addButton: {
      backgroundColor: theme.accent,
      padding: 19,
      borderRadius: 17,
      alignItems: 'center',
      marginTop: 15,
    },

    addButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    footer: {
      textAlign: 'center',
      color: theme.secondary,
      fontSize: 11,
      marginTop: 25,
    },

  });
