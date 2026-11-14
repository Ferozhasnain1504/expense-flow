
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const categoryIcons = {
  Food: '🍔',
  Transport: '🚕',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Bills: '🧾',
  Other: '💰',
};

export default function TransactionItem({ item }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {categoryIcons[item.category] || '💰'}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.subtitle}>
          {item.category} · {item.date}
        </Text>
      </View>

      <Text style={styles.amount}>
        - ₹{Number(item.amount).toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#19243B',
    padding: 16,
    borderRadius: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#27334C',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 21,
  },

  details: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  amount: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '800',
  },
});
