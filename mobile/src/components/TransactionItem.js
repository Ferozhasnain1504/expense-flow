
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const categoryIcons = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '💰',
};

export default function TransactionItem({ item }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const icon = categoryIcons[item.category] || '💰';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>

          <Text
            style={[
              styles.category,
              { color: colors.secondaryText },
            ]}
          >
            {item.category} · {item.date || 'Today'}
          </Text>
        </View>
      </View>

      <Text style={[styles.amount, { color: colors.text }]}>
        -₹{Number(item.amount).toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 12,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 21,
  },

  details: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
  },

  category: {
    fontSize: 11,
    marginTop: 5,
  },

  amount: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
});
