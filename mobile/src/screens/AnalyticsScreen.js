
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { PieChart, BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const { transactions, totalExpenses } = useExpenses();

  // Calculate spending for each category.
  const categoryTotals = transactions.reduce((result, item) => {
    const category = item.category || 'Other';
    const amount = Number(item.amount) || 0;

    result[category] = (result[category] || 0) + amount;
    return result;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

    const chartColors = [
    '#8B5CF6',
    '#06B6D4',
    '#F59E0B',
    '#10B981',
    '#EF4444',
    '#EC4899',
    '#6366F1',
    ];

    const pieChartData = categoryData.map((item, index) => ({
        name: item.category,
        amount: item.amount,
        color: chartColors[index % chartColors.length],
        legendFontColor: '#FFFFFF',
        legendFontSize: 12,
    }));

  const highestCategory = categoryData[0];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Analytics</Text>
        <Text style={styles.subtitle}>
          Understand your spending habits
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spending</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.summaryCaption}>
          Across {transactions.length} transactions
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightLabel}>Top Spending Category</Text>
        <Text style={styles.insightValue}>
          {highestCategory ? highestCategory.category : 'No data yet'}
        </Text>
        <Text style={styles.insightAmount}>
          {highestCategory
            ? `₹${highestCategory.amount.toLocaleString('en-IN')}`
            : 'Add expenses to see insights'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Spending Distribution</Text>

    {pieChartData.length > 0 && (
        <View style={styles.chartCard}>
            <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={{
                color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            }}
            />
        </View>
      )}

      <Text style={styles.sectionTitle}>Category Comparison</Text>

    {categoryData.length > 0 && (
    <View style={styles.chartCard}>
        <BarChart
        data={{
            labels: categoryData.map((item) => item.category),
            datasets: [
                {
                    data: categoryData.map((item) => item.amount),
                },
            ],
        }}
        width={Dimensions.get('window').width - 40}
        height={250}
        yAxisLabel="₹"
        yAxisSuffix=""
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
            backgroundColor: '#191F35',
            backgroundGradientFrom: '#191F35',
            backgroundGradientTo: '#191F35',
            decimalPlaces: 0,
            color: (opacity = 1) =>
            `rgba(167,139,250,${opacity})`,
            labelColor: (opacity = 1) =>
            `rgba(255,255,255,${opacity})`,
            propsForBackgroundLines: {
            stroke: '#303750',
            },
            barPercentage: 0.6,
        }}
        style={{
            borderRadius: 14,
        }}
        />
    </View>
    )}

      <Text style={styles.sectionTitle}>Category Breakdown</Text>

      {categoryData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No spending data yet.</Text>
          <Text style={styles.emptySubtext}>
            Add your first expense to see analytics.
          </Text>
        </View>
      ) : (
        categoryData.map((item) => (
          <View key={item.category} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>
                {item.category}
              </Text>
              <Text style={styles.categoryAmount}>
                ₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.percentage}%` },
                ]}
              />
            </View>

            <Text style={styles.percentageText}>
              {item.percentage.toFixed(1)}% of total spending
            </Text>
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
    marginBottom: 16,
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
  summaryCaption: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: '#25213F',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  insightLabel: {
    color: '#B9A7EA',
    fontSize: 13,
  },
  insightValue: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginTop: 8,
  },
  insightAmount: {
    color: '#C4B5FD',
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#191F35',
    padding: 17,
    borderRadius: 14,
    marginBottom: 13,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  categoryAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBackground: {
    height: 9,
    backgroundColor: '#303750',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 9,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
  },
  percentageText: {
    color: '#9298AA',
    fontSize: 11,
    marginTop: 8,
  },
  emptyState: {
    padding: 25,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#9298AA',
    fontSize: 13,
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: '#191F35',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 28,
    alignItems: 'center',
  },
});
