
import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { fetchFinancialInsights } from '../services/financialInsightsService';
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

const getMonthKey = (date) =>
  `${date.getFullYear()}-${date.getMonth()}`;

const getMonthStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

export default function AnalyticsScreen() {
  const { transactions } = useExpenses();
  const { theme } = useTheme();

  const colors = theme.colors;
  const isDark = theme.mode === 'dark';
  const styles = createStyles(colors, isDark);

  const [selectedPeriod, setSelectedPeriod] = useState('Last 6 months');

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

  // REPORTING PERIOD

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

  // FILTER TRANSACTIONS

  const periodTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) return false;

      return date >= periodStart && date <= now;
    });
  }, [transactions, periodStart]);

  // TOTAL SPENDING

  const totalExpenses = periodTransactions.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0
  );

  // CATEGORY TOTALS

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

  // MONTHLY SPENDING DATA

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

  // MONTHLY COMPARISON

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

  // CHART DATA

  const pieChartData = categoryData.map((item, index) => ({
    name: item.category,
    amount: item.amount,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `rgba(139,92,246,${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(255,255,255,${opacity})`
        : `rgba(23,25,35,${opacity})`,
    propsForBackgroundLines: {
      stroke: colors.border,
    },
    barPercentage: 0.6,
  };

  const chartWidth = Dimensions.get('window').width - 42;

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
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          YOUR FINANCIAL OVERVIEW
        </Text>

        <Text style={styles.heading}>
          Analytics
        </Text>

        <Text style={styles.subtitle}>
          Understand your spending habits and make smarter decisions.
        </Text>
      </View>

      {/* REPORTING PERIOD */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Reporting Period
        </Text>
      </View>

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
                selected && styles.selectedPeriodButton,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  selected && styles.selectedPeriodText,
                ]}
              >
                {period}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* TOTAL SPENDING */}

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>
              TOTAL SPENDING
            </Text>

            <Text style={styles.summaryAmount}>
              {formatCurrency(totalExpenses)}
            </Text>

            <Text style={styles.summaryCaption}>
              {periodTransactions.length} transactions · {selectedPeriod}
            </Text>
          </View>

          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>₹</Text>
          </View>
        </View>
      </View>

      {/* SMART FINANCIAL INSIGHTS */}

      <SectionHeading
        title="Smart Financial Insights"
        subtitle="Personalised observations from your spending data"
        styles={styles}
      />

      <FinancialInsightsSection
        insights={financialInsights}
        loading={insightsLoading}
        error={insightsError}
        colors={colors}
        styles={styles}
        formatCurrency={formatCurrency}
      />

      {/* MONTHLY COMPARISON */}

      <SectionHeading
        title="Monthly Comparison"
        subtitle="Compare your current and previous month"
        styles={styles}
      />

      <View style={styles.comparisonCard}>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonLabel}>
              THIS MONTH
            </Text>

            <Text style={styles.comparisonAmount}>
              {formatCurrency(comparison.currentTotal)}
            </Text>
          </View>

          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonLabel}>
              PREVIOUS MONTH
            </Text>

            <Text style={styles.comparisonAmount}>
              {formatCurrency(comparison.previousTotal)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text
          style={[
            styles.comparisonMessage,
            { color: comparisonColor },
          ]}
        >
          {comparisonMessage}
        </Text>

        {comparison.previousTotal > 0 && (
          <Text style={styles.comparisonDifference}>
            {comparison.difference > 0 ? '+' : ''}
            {formatCurrency(comparison.difference)} compared with last month
          </Text>
        )}
      </View>

      {/* MONTHLY SPENDING TREND */}

      <SectionHeading
        title="Monthly Spending Trend"
        subtitle="Track how your expenses change over time"
        styles={styles}
      />

      {monthlyData.some((item) => item.amount > 0) ? (
        <View style={styles.chartCard}>
          <BarChart
            data={{
              labels: monthlyData.map((item) => item.label),
              datasets: [
                {
                  data: monthlyData.map((item) => item.amount),
                },
              ],
            }}
            width={chartWidth-20}
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
          styles={styles}
          message="No monthly spending data for this period."
        />
      )}

      {/* TOP CATEGORY */}

      <View style={styles.topCategoryCard}>
        <Text style={styles.topCategoryLabel}>
          TOP SPENDING CATEGORY
        </Text>

        <Text style={styles.topCategoryValue}>
          {highestCategory
            ? highestCategory.category
            : 'No data yet'}
        </Text>

        <Text style={styles.topCategoryAmount}>
          {highestCategory
            ? formatCurrency(highestCategory.amount)
            : 'Add expenses to see insights'}
        </Text>
      </View>

      {/* SPENDING DISTRIBUTION */}

      <SectionHeading
        title="Spending Distribution"
        subtitle="See how your money is divided across categories"
        styles={styles}
      />

      {pieChartData.length > 0 ? (
        <View style={styles.chartCard}>
          <PieChart
            data={pieChartData}
            width={chartWidth}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={chartConfig}
          />
        </View>
      ) : (
        <EmptyChart colors={colors} styles={styles} />
      )}

      {/* CATEGORY COMPARISON */}

      <SectionHeading
        title="Category Comparison"
        subtitle="Compare spending amounts across categories"
        styles={styles}
      />

      {categoryData.length > 0 ? (
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
            width={chartWidth}
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
        <EmptyChart colors={colors} styles={styles} />
      )}

      {/* CATEGORY BREAKDOWN */}

      <SectionHeading
        title="Category Breakdown"
        subtitle="A detailed look at where your money goes"
        styles={styles}
      />

      {categoryData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>

          <Text style={styles.emptyTitle}>
            No spending data yet
          </Text>

          <Text style={styles.emptyText}>
            Add expenses to see analytics for this period.
          </Text>
        </View>
      ) : (
        categoryData.map((item, index) => (
          <View
            key={item.category}
            style={styles.categoryCard}
          >
            <View style={styles.categoryHeader}>
              <View style={styles.categoryNameRow}>
                <View
                  style={[
                    styles.categoryDot,
                    {
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    },
                  ]}
                />

                <Text style={styles.categoryName}>
                  {item.category}
                </Text>
              </View>

              <Text style={styles.categoryAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>

            <View style={styles.progressBackground}>
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

            <Text style={styles.percentageText}>
              {item.percentage.toFixed(1)}% of total spending
            </Text>
          </View>
        ))
      )}

      <View style={styles.bottomNote}>
        <Text style={styles.bottomNoteText}>
          Your financial journey starts with understanding your spending.
        </Text>
      </View>
    </ScrollView>
  );
}

// REUSABLE SECTION HEADING

function SectionHeading({ title, subtitle, styles }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

// FINANCIAL INSIGHTS

function FinancialInsightsSection({
  insights,
  loading,
  error,
  colors,
  styles,
  formatCurrency,
}) {
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={styles.emptyText}>
          Analysing your spending...
        </Text>
      </View>
    );
  }

  if (error || !insights) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyTitle}>
          Insights unavailable
        </Text>
        <Text style={styles.emptyText}>
          Unable to load financial insights. Please try again later.
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
    <View style={styles.financialInsightCard}>
      <View
        style={[
          styles.insightAccent,
          { backgroundColor: color },
        ]}
      />

      <View style={styles.insightContent}>
        <Text
          style={[
            styles.financialInsightTitle,
            { color },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.financialInsightMessage}>
          {message}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      {/* HEALTH SCORE */}

      <View style={styles.healthCard}>
        <Text style={styles.healthEyebrow}>
          SPENDING HEALTH SCORE
        </Text>

        <View style={styles.healthScoreRow}>
          <Text
            style={[
              styles.healthScore,
              { color: healthColor },
            ]}
          >
            {score === null ? 'N/A' : `${score}/100`}
          </Text>

          <View
            style={[
              styles.healthBadge,
              {
                backgroundColor: `${healthColor}18`,
              },
            ]}
          >
            <Text
              style={[
                styles.healthLabel,
                { color: healthColor },
              ]}
            >
              {score === null
                ? 'Insufficient data'
                : isPartialScore
                  ? 'Partial score'
                  : health?.label || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.healthProgressBackground}>
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

        <Text style={styles.healthDescription}>
          {isPartialScore
            ? `Based on ${availableComponents} of 3 available components. This is not a complete financial health assessment.`
            : score === null
              ? 'More financial data is needed to calculate your spending health.'
              : 'Based on budget adherence, spending trends and consistency.'}
        </Text>

        <View style={styles.componentList}>
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
              style={styles.componentRow}
            >
              <Text style={styles.componentLabel}>
                {item.label}
              </Text>

              <Text style={styles.componentValue}>
                {item.available && item.value !== null
                  ? `${item.value}/100`
                  : 'Insufficient data'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* SPENDING TRENDS */}

      <Text style={styles.insightSectionTitle}>
        Spending Trends
      </Text>

      {trends.length === 0 ? (
        <InsightCard
          title="Building your spending history"
          message="Not enough spending data to identify trends yet."
          color={colors.secondaryText}
        />
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

      <Text style={styles.insightSectionTitle}>
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

      <Text style={styles.insightSectionTitle}>
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

      <Text style={styles.insightSectionTitle}>
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

// EMPTY CHART

function EmptyChart({
  colors,
  styles,
  message = 'Add expenses to generate this chart.',
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>

      <Text style={styles.emptyText}>
        {message}
      </Text>
    </View>
  );
}

// THEME-AWARE STYLES

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 40,
    },

    // HEADER

    header: {
      marginBottom: 28,
    },

    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 9,
    },

    heading: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '800',
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
    },

    // SECTION HEADINGS

    sectionHeading: {
      marginTop: 27,
      marginBottom: 15,
    },

    sectionHeader: {
      marginBottom: 13,
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
      lineHeight: 17,
    },

    // REPORTING PERIOD

    periodContainer: {
      marginBottom: 22,
      flexGrow: 0,
    },

    periodButton: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginRight: 9,
    },

    selectedPeriodButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    periodText: {
      color: colors.secondaryText,
      fontSize: 12,
      fontWeight: '700',
    },

    selectedPeriodText: {
      color: '#FFFFFF',
    },

    // SUMMARY CARD

    summaryCard: {
      backgroundColor: colors.primary,
      padding: 23,
      borderRadius: 23,
      marginBottom: 5,
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 9,
    },

    summaryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    summaryLabel: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      opacity: 0.9,
    },

    summaryAmount: {
      color: '#FFFFFF',
      fontSize: 31,
      fontWeight: '800',
      marginTop: 12,
    },

    summaryCaption: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 11,
      marginTop: 8,
    },

    summaryIcon: {
      width: 53,
      height: 53,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    summaryIconText: {
      color: '#FFFFFF',
      fontSize: 26,
      fontWeight: '800',
    },

    // COMPARISON

    comparisonCard: {
      backgroundColor: colors.card,
      borderRadius: 19,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    comparisonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    comparisonColumn: {
      flex: 1,
    },

    comparisonLabel: {
      color: colors.secondaryText,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.7,
    },

    comparisonAmount: {
      color: colors.text,
      fontSize: 19,
      fontWeight: '800',
      marginTop: 10,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 17,
    },

    comparisonMessage: {
      fontSize: 13,
      fontWeight: '800',
    },

    comparisonDifference: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 7,
    },

    // CHARTS

    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 19,
      paddingVertical: 15,
      paddingHorizontal: 5,
      marginBottom: 5,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      overflow: 'hidden',
    },

    chart: {
      borderRadius: 14,
    },

    // TOP CATEGORY

    topCategoryCard: {
      backgroundColor: isDark ? '#25213F' : '#EDE9FE',
      padding: 21,
      borderRadius: 19,
      marginTop: 25,
    },

    topCategoryLabel: {
      color: isDark ? '#B9A7EA' : '#6D28D9',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },

    topCategoryValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 11,
    },

    topCategoryAmount: {
      color: isDark ? '#C4B5FD' : '#7C3AED',
      fontSize: 14,
      fontWeight: '700',
      marginTop: 6,
    },

    // CATEGORY BREAKDOWN

    categoryCard: {
      backgroundColor: colors.card,
      padding: 17,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },

    categoryNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    categoryDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      marginRight: 9,
    },

    categoryName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },

    categoryAmount: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },

    progressBackground: {
      height: 8,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },

    progressFill: {
      height: 8,
      borderRadius: 10,
    },

    percentageText: {
      color: colors.secondaryText,
      fontSize: 10,
      marginTop: 9,
    },

    // EMPTY STATES

    emptyState: {
      backgroundColor: colors.card,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },

    emptyIcon: {
      fontSize: 25,
      marginBottom: 10,
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 6,
      textAlign: 'center',
    },

    emptyText: {
      color: colors.secondaryText,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 19,
    },

    // FINANCIAL HEALTH

    healthCard: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },

    healthEyebrow: {
      color: colors.secondaryText,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },

    healthScoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 13,
      flexWrap: 'wrap',
      gap: 8,
    },

    healthScore: {
      fontSize: 34,
      fontWeight: '900',
    },

    healthBadge: {
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 10,
    },

    healthLabel: {
      fontSize: 11,
      fontWeight: '800',
    },

    healthProgressBackground: {
      height: 9,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginBottom: 13,
    },

    healthProgressFill: {
      height: 9,
      borderRadius: 10,
    },

    healthDescription: {
      color: colors.secondaryText,
      fontSize: 11,
      lineHeight: 18,
    },

    componentList: {
      marginTop: 17,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 15,
    },

    componentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },

    componentLabel: {
      color: colors.secondaryText,
      fontSize: 11,
      flex: 1,
    },

    componentValue: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'right',
    },

    // INSIGHT CARDS

    insightSectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      marginTop: 22,
      marginBottom: 12,
    },

    financialInsightCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      flexDirection: 'row',
      overflow: 'hidden',
    },

    insightAccent: {
      width: 4,
    },

    insightContent: {
      flex: 1,
      padding: 15,
    },

    financialInsightTitle: {
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 6,
    },

    financialInsightMessage: {
      color: colors.secondaryText,
      fontSize: 11,
      lineHeight: 18,
    },

    // FOOTER

    bottomNote: {
      marginTop: 23,
      paddingVertical: 17,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    bottomNoteText: {
      color: colors.secondaryText,
      fontSize: 11,
      lineHeight: 18,
      textAlign: 'center',
    },
  });
