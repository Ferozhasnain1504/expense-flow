
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { PieChart, BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const { transactions, totalExpenses } = useExpenses();
  const { theme } = useTheme();
  const colors = theme.colors;

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
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const highestCategory = categoryData[0];

  // Shared chart configuration.
  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `rgba(139,92,246,${opacity})`,
    labelColor: (opacity = 1) =>
      theme.mode === 'dark'
        ? `rgba(255,255,255,${opacity})`
        : `rgba(23,25,35,${opacity})`,
    propsForBackgroundLines: {
      stroke: colors.border,
    },
    barPercentage: 0.6,
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Analytics
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.secondaryText },
          ]}
        >
          Understand your spending habits
        </Text>
      </View>

      {/* TOTAL SPENDING */}

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
          Total Spending
        </Text>

        <Text style={[styles.summaryAmount, { color: colors.text }]}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>

        <Text style={styles.summaryCaption}>
          Across {transactions.length} transactions
        </Text>
      </View>

      {/* TOP SPENDING CATEGORY */}

      <View
        style={[
          styles.insightCard,
          {
            backgroundColor: theme.mode === 'dark'
              ? '#25213F'
              : '#EDE9FE',
          },
        ]}
      >
        <Text
          style={[
            styles.insightLabel,
            { color: theme.mode === 'dark' ? '#B9A7EA' : '#6D28D9' },
          ]}
        >
          Top Spending Category
        </Text>

        <Text
          style={[
            styles.insightValue,
            { color: colors.text },
          ]}
        >
          {highestCategory
            ? highestCategory.category
            : 'No data yet'}
        </Text>

        <Text
          style={[
            styles.insightAmount,
            {
              color: theme.mode === 'dark'
                ? '#C4B5FD'
                : '#7C3AED',
            },
          ]}
        >
          {highestCategory
            ? `₹${highestCategory.amount.toLocaleString('en-IN')}`
            : 'Add expenses to see insights'}
        </Text>
      </View>

      {/* PIE CHART */}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Spending Distribution
      </Text>

      {pieChartData.length > 0 ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card },
          ]}
        >
          <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={chartConfig}
          />
        </View>
      ) : (
        <EmptyChart colors={colors} />
      )}

      {/* BAR CHART */}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Category Comparison
      </Text>

      {categoryData.length > 0 ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card },
          ]}
        >
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
            chartConfig={chartConfig}
            style={{
              borderRadius: 14,
            }}
          />
        </View>
      ) : (
        <EmptyChart colors={colors} />
      )}

      {/* CATEGORY BREAKDOWN */}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Category Breakdown
      </Text>

      {categoryData.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No spending data yet.
          </Text>

          <Text
            style={[
              styles.emptySubtext,
              { color: colors.secondaryText },
            ]}
          >
            Add your first expense to see analytics.
          </Text>
        </View>
      ) : (
        categoryData.map((item, index) => (
          <View
            key={item.category}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.categoryHeader}>
              <Text
                style={[
                  styles.categoryName,
                  { color: colors.text },
                ]}
              >
                {item.category}
              </Text>

              <Text
                style={[
                  styles.categoryAmount,
                  { color: colors.text },
                ]}
              >
                ₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View
              style={[
                styles.progressBackground,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor:
                      chartColors[index % chartColors.length],
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.percentageText,
                { color: colors.secondaryText },
              ]}
            >
              {item.percentage.toFixed(1)}% of total spending
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// Empty chart component.
function EmptyChart({ colors }) {
  return (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: colors.card,
          marginBottom: 28,
        },
      ]}
    >
      <Text style={{ color: colors.secondaryText }}>
        Add expenses to generate this chart.
      </Text>
    </View>
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
    fontSize: 13,
  },

  insightValue: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 8,
  },

  insightAmount: {
    fontSize: 14,
    marginTop: 5,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
  },

  chartCard: {
    backgroundColor: '#191F35',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 28,
    alignItems: 'center',
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
    borderRadius: 14,
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
});
