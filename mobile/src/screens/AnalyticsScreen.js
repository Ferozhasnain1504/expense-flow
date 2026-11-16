
import React, { useEffect, useMemo, useState } from 'react';
import { fetchFinancialInsights } from '../services/financialInsightsService';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { PieChart, BarChart } from 'react-native-chart-kit';

const PERIOD_OPTIONS = [
  'This month',
  'Last 3 months',
  'Last 6 months',
  'This year',
];

const CHART_COLORS = [
  '#8B5CF6',
  '#06B6D4',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#EC4899',
  '#6366F1',
];

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

export default function AnalyticsScreen() {
  const { transactions } = useExpenses();
  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedPeriod, setSelectedPeriod] =
    useState('Last 6 months');

  const [financialInsights, setFinancialInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(false);

  useEffect(() => {
  const loadFinancialInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(false);

      const currentDate = new Date();

      const data = await fetchFinancialInsights(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );

      setFinancialInsights(data);
    } catch (error) {
  console.log('FINANCIAL INSIGHTS ERROR:', {
    message: error.message,
    status: error.response?.status,
    response: error.response?.data,
    url: error.config?.url,
  });

  setInsightsError(true);
} finally {
      setInsightsLoading(false);
    }
  };

  loadFinancialInsights();
}, []);

  const now = new Date();

  // Determine the start of the selected reporting period.
  const periodStart = useMemo(() => {
    const currentMonth = getMonthStart(now);

    if (selectedPeriod === 'This month') {
      return currentMonth;
    }

    if (selectedPeriod === 'Last 3 months') {
      return new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      );
    }

    if (selectedPeriod === 'Last 6 months') {
      return new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1
      );
    }

    return new Date(now.getFullYear(), 0, 1);
  }, [selectedPeriod]);

  // Filter expenses for the selected reporting period.
  const periodTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) return false;

      return date >= periodStart && date <= now;
    });
  }, [transactions, periodStart]);

  // Calculate spending for the selected period.
  const totalExpenses = periodTransactions.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0
  );

  // Calculate category-wise spending.
  const categoryTotals = periodTransactions.reduce(
    (result, item) => {
      const category = item.category || 'Other';
      const amount = Number(item.amount) || 0;

      result[category] = (result[category] || 0) + amount;

      return result;
    },
    {}
  );

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0
          ? (amount / totalExpenses) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestCategory = categoryData[0];

  // Build monthly spending data for the selected period.
  const monthlyData = useMemo(() => {
    const months = [];

    let cursor = new Date(periodStart);

    while (
      cursor.getFullYear() < now.getFullYear() ||
      (
        cursor.getFullYear() === now.getFullYear() &&
        cursor.getMonth() <= now.getMonth()
      )
    ) {
      const monthKey = getMonthKey(cursor);

      const monthTotal = periodTransactions.reduce(
        (total, item) => {
          const expenseDate = new Date(item.date);

          if (
            !Number.isNaN(expenseDate.getTime()) &&
            getMonthKey(expenseDate) === monthKey
          ) {
            return total + (Number(item.amount) || 0);
          }

          return total;
        },
        0
      );

      months.push({
        label: cursor.toLocaleString('en-IN', {
          month: 'short',
        }),
        amount: monthTotal,
      });

      cursor = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        1
      );
    }

    return months;
  }, [periodStart, periodTransactions]);

  // Calculate current month versus previous month.
  const comparison = useMemo(() => {
    const currentMonth = getMonthStart(now);

    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    let currentTotal = 0;
    let previousTotal = 0;

    transactions.forEach((item) => {
      const date = new Date(item.date);
      const amount = Number(item.amount) || 0;

      if (Number.isNaN(date.getTime())) return;

      if (getMonthKey(date) === getMonthKey(currentMonth)) {
        currentTotal += amount;
      } else if (
        getMonthKey(date) === getMonthKey(previousMonth)
      ) {
        previousTotal += amount;
      }
    });

    const difference = currentTotal - previousTotal;

    const percentage =
      previousTotal > 0
        ? (Math.abs(difference) / previousTotal) * 100
        : null;

    return {
      currentTotal,
      previousTotal,
      difference,
      percentage,
    };
  }, [transactions]);

  // Prepare pie chart data.
  const pieChartData = categoryData.map((item, index) => ({
    name: item.category,
    amount: item.amount,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  // Chart configuration.
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

  const comparisonMessage =
    comparison.previousTotal === 0
      ? comparison.currentTotal > 0
        ? 'No spending last month to compare'
        : 'No spending recorded'
      : comparison.difference > 0
        ? `Spending increased by ${comparison.percentage.toFixed(1)}%`
        : comparison.difference < 0
          ? `Spending decreased by ${comparison.percentage.toFixed(1)}%`
          : 'Spending is unchanged';

  const comparisonColor =
    comparison.difference > 0
      ? colors.danger
      : comparison.difference < 0
        ? '#10B981'
        : colors.secondaryText;

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

      {/* REPORTING PERIOD */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Reporting Period
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
      >
        {PERIOD_OPTIONS.map((period) => {
          const selected = selectedPeriod === period;

          return (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selected
                    ? colors.primary
                    : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: selected
                      ? '#FFFFFF'
                      : colors.secondaryText,
                  },
                ]}
              >
                {period}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

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
          {formatCurrency(totalExpenses)}
        </Text>

        <Text style={styles.summaryCaption}>
          {periodTransactions.length} transactions in {selectedPeriod.toLowerCase()}
        </Text>
      </View>

            {/* SMART FINANCIAL INSIGHTS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Smart Financial Insights
      </Text>

      <FinancialInsightsSection
        insights={financialInsights}
        loading={insightsLoading}
        error={insightsError}
        colors={colors}
        formatCurrency={formatCurrency}
      />

      {/* MONTHLY COMPARISON */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Monthly Comparison
      </Text>

      <View
        style={[
          styles.comparisonCard,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            <Text
              style={[
                styles.comparisonLabel,
                { color: colors.secondaryText },
              ]}
            >
              This Month
            </Text>

            <Text
              style={[
                styles.comparisonAmount,
                { color: colors.text },
              ]}
            >
              {formatCurrency(comparison.currentTotal)}
            </Text>
          </View>

          <View style={styles.comparisonColumn}>
            <Text
              style={[
                styles.comparisonLabel,
                { color: colors.secondaryText },
              ]}
            >
              Previous Month
            </Text>

            <Text
              style={[
                styles.comparisonAmount,
                { color: colors.text },
              ]}
            >
              {formatCurrency(comparison.previousTotal)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.comparisonDivider,
            { backgroundColor: colors.border },
          ]}
        />

        <Text
          style={[
            styles.comparisonMessage,
            { color: comparisonColor },
          ]}
        >
          {comparisonMessage}
        </Text>

        {comparison.previousTotal > 0 && (
          <Text
            style={[
              styles.comparisonDifference,
              { color: colors.secondaryText },
            ]}
          >
            {comparison.difference > 0 ? '+' : ''}
            {formatCurrency(comparison.difference)} compared with last month
          </Text>
        )}
      </View>

      {/* MONTHLY SPENDING TREND */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Monthly Spending Trend
      </Text>

      {monthlyData.some((item) => item.amount > 0) ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card },
          ]}
        >
          <BarChart
            data={{
              labels: monthlyData.map((item) => item.label),
              datasets: [
                {
                  data: monthlyData.map((item) => item.amount),
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
            style={styles.chart}
          />
        </View>
      ) : (
        <EmptyChart
          colors={colors}
          message="No monthly spending data for this period."
        />
      )}

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
            {
              color: theme.mode === 'dark'
                ? '#B9A7EA'
                : '#6D28D9',
            },
          ]}
        >
          Top Spending Category
        </Text>

        <Text style={[styles.insightValue, { color: colors.text }]}>
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
            ? formatCurrency(highestCategory.amount)
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

      {/* CATEGORY COMPARISON */}
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
            style={styles.chart}
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
            Add expenses to see analytics for this period.
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
                {formatCurrency(item.amount)}
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
                      CHART_COLORS[index % CHART_COLORS.length],
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


function FinancialInsightsSection({
  insights,
  loading,
  error,
  colors,
  formatCurrency,
}) {
  if (loading) {
    return (
      <View
        style={[
          styles.emptyState,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={{ color: colors.secondaryText }}>
          Analysing your spending...
        </Text>
      </View>
    );
  }

  if (error || !insights) {
    return (
      <View
        style={[
          styles.emptyState,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={{ color: colors.secondaryText }}>
          Unable to load financial insights.
        </Text>
      </View>
    );
  }

  const health = insights.spendingHealth;
  const score = health?.score ?? null;
  const dataAvailable = health?.dataAvailable || {};

  const availableComponents = [
    dataAvailable.budget,
    dataAvailable.spendingTrends,
    dataAvailable.consistency,
  ].filter(Boolean).length;

  const isPartialScore =
    score !== null && availableComponents < 3;

  const healthColor =
    score === null
      ? colors.secondaryText
      : score >= 80
        ? '#10B981'
        : score >= 60
          ? '#F59E0B'
          : '#EF4444';

  const trends = insights.spendingTrends || [];
  const unusualExpenses = insights.unusualExpenses || [];
  const budgetAlerts = insights.budgetRecommendations || [];
  const opportunities = insights.savingsOpportunities || [];

  const InsightCard = ({ title, message, color }) => (
    <View
      style={[
        styles.financialInsightCard,
        { backgroundColor: colors.card },
      ]}
    >
      <Text style={[styles.financialInsightTitle, { color }]}>
        {title}
      </Text>

      <Text style={{ color: colors.secondaryText, lineHeight: 21 }}>
        {message}
      </Text>
    </View>
  );

  return (
    <View>
      {/* SPENDING HEALTH SCORE */}
      <View
        style={[
          styles.healthCard,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
          SPENDING HEALTH SCORE
        </Text>

        <View style={styles.healthScoreRow}>
          <Text style={[styles.healthScore, { color: healthColor }]}>
            {score === null ? 'N/A' : `${score}/100`}
          </Text>

          <Text style={[styles.healthLabel, { color: healthColor }]}>
            {score === null
              ? 'Insufficient data'
              : isPartialScore
                ? 'Partial score'
                : health?.label || 'Not available'}
          </Text>
        </View>

        <View
          style={[
            styles.healthProgressBackground,
            { backgroundColor: colors.surface },
          ]}
        >
          <View
            style={[
              styles.healthProgressFill,
              {
                width: `${Math.max(0, Math.min(100, score ?? 0))}%`,
                backgroundColor: healthColor,
              },
            ]}
          />
        </View>

        <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
          {isPartialScore
            ? `Based on ${availableComponents} of 3 available components. This is not a complete financial health assessment.`
            : score === null
              ? 'More financial data is needed to calculate your spending health.'
              : 'Based on budget adherence, spending trends and consistency.'}
        </Text>

        <View style={{ marginTop: 12, gap: 8 }}>
          {[
            {
              label: 'Budget management',
              available: dataAvailable.budget,
              value: health?.components?.budgetScore,
            },
            {
              label: 'Spending trends',
              available: dataAvailable.spendingTrends,
              value: health?.components?.trendScore,
            },
            {
              label: 'Spending consistency',
              available: dataAvailable.consistency,
              value: health?.components?.consistencyScore,
            },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
                {item.label}
              </Text>

              <Text style={{ color: colors.text, fontSize: 12 }}>
                {item.available && item.value !== null
                  ? `${item.value}/100`
                  : 'Insufficient data'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* SPENDING TRENDS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Spending Trends
      </Text>

      {trends.length === 0 ? (
        <Text style={{ color: colors.secondaryText, marginBottom: 20 }}>
          Not enough spending data to identify trends yet.
        </Text>
      ) : (
        trends.map((item, index) => (
          <InsightCard
            key={`${item.category}-${index}`}
            title={`${item.category}: ${
              item.trend === 'increased'
                ? 'Spending increased'
                : item.trend === 'decreased'
                  ? 'Spending decreased'
                  : item.trend === 'stable'
                    ? 'Spending is stable'
                    : 'Building history'
            }`}
            message={
              item.changePercentage === null
                ? 'More historical transactions are needed for comparison.'
                : `${Math.abs(item.changePercentage)}% ${
                    item.changePercentage >= 0 ? 'higher' : 'lower'
                  } than the previous three-month average daily spending.`
            }
            color={
              item.trend === 'increased'
                ? '#EF4444'
                : item.trend === 'decreased'
                  ? '#10B981'
                  : colors.primary
            }
          />
        ))
      )}

      {/* UNUSUAL EXPENSES */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Unusual Expenses
      </Text>

      {unusualExpenses.length === 0 ? (
        <InsightCard
          title="No unusual expenses detected"
          message="No transactions currently meet the unusual spending threshold."
          color="#10B981"
        />
      ) : (
        unusualExpenses.map((item) => (
          <InsightCard
            key={item.id}
            title={item.title}
            message={`${item.category} · ${formatCurrency(item.amount)} · Historical median: ${formatCurrency(item.historicalAverage)}`}
            color="#EF4444"
          />
        ))
      )}

      {/* BUDGET ALERTS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Budget Alerts
      </Text>

      {!insights.budget ? (
        <InsightCard
          title="No monthly budget found"
          message="Create a monthly budget to receive budget alerts and recommendations."
          color={colors.secondaryText}
        />
      ) : budgetAlerts.length === 0 ? (
        <InsightCard
          title="You're within your category budgets"
          message="No category budget alerts at the moment."
          color="#10B981"
        />
      ) : (
        budgetAlerts.map((item, index) => (
          <InsightCard
            key={`${item.category}-${index}`}
            title={item.category}
            message={item.message}
            color={
              item.priority === 'high'
                ? '#EF4444'
                : item.priority === 'medium'
                  ? '#F59E0B'
                  : colors.primary
            }
          />
        ))
      )}

      {/* SAVINGS OPPORTUNITIES */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Potential Savings Opportunities
      </Text>

      {opportunities.length === 0 ? (
        <InsightCard
          title="No major increases detected"
          message="We'll highlight potential savings opportunities when your spending patterns show significant increases."
          color="#10B981"
        />
      ) : (
        opportunities.map((item, index) => (
          <InsightCard
            key={`${item.category}-${index}`}
            title={item.category}
            message={item.message}
            color={colors.primary}
          />
        ))
      )}
    </View>
  );
}



function EmptyChart({
  colors,
  message = 'Add expenses to generate this chart.',
}) {
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
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginTop: 45,
    marginBottom: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
  },

  periodContainer: {
    marginBottom: 20,
    flexGrow: 0,
  },

  periodButton: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 9,
  },

  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },

  summaryCard: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 28,
  },

  summaryLabel: {
    fontSize: 14,
  },

  summaryAmount: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },

  summaryCaption: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 8,
  },

  comparisonCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },

  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  comparisonColumn: {
    flex: 1,
  },

  comparisonLabel: {
    fontSize: 12,
  },

  comparisonAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },

  comparisonDivider: {
    height: 1,
    marginVertical: 17,
  },

  comparisonMessage: {
    fontSize: 14,
    fontWeight: '700',
  },

  comparisonDifference: {
    fontSize: 12,
    marginTop: 6,
  },

  chartCard: {
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 28,
    alignItems: 'center',
  },

  chart: {
    borderRadius: 14,
  },

  insightCard: {
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

  categoryCard: {
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
    fontSize: 15,
    fontWeight: '600',
  },

  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },

  progressBackground: {
    height: 9,
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 9,
    borderRadius: 10,
  },

  percentageText: {
    fontSize: 11,
    marginTop: 8,
  },

  emptyState: {
    padding: 25,
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 28,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },

  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
  },

  healthCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  healthScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },

  healthScore: {
    fontSize: 34,
    fontWeight: '800',
  },

  healthLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  healthProgressBackground: {
    height: 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },

  healthProgressFill: {
    height: 9,
    borderRadius: 10,
  },

  financialInsightCard: {
    padding: 17,
    borderRadius: 14,
    marginBottom: 12,
  },

  financialInsightTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 7,
  },

});
