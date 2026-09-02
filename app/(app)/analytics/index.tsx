import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { AnalyticsCard } from '@/components/cards/AnalyticsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyticsService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function AnalyticsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getOverview,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Performance Analytics' }} />
      <ScreenWrapper>
        <Text style={styles.subtitle}>Track your business performance</Text>

        {isLoading ? (
          <View style={styles.grid}>
            <Skeleton height={120} style={{ flex: 1 }} />
            <Skeleton height={120} style={{ flex: 1 }} />
          </View>
        ) : data ? (
          <>
            <View style={styles.grid}>
              <AnalyticsCard label="Total Views" value={data.totalViews.toLocaleString()} icon="eye-outline" />
              <AnalyticsCard label="Product Views" value={data.productViews.toLocaleString()} icon="cube-outline" />
              <AnalyticsCard label="Orders" value={data.orders} icon="receipt-outline" />
              <AnalyticsCard label="Conversion Rate" value={`${data.conversionRate}%`} icon="trending-up-outline" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Selling Products</Text>
              {data.topProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productSales}>{p.sales} sales</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Low Performing Products</Text>
              {data.lowProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={[styles.productSales, { color: colors.danger }]}>{p.sales} sales</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  productName: { ...typography.bodySmall, color: colors.text, flex: 1 },
  productSales: { ...typography.bodySmall, color: colors.success, fontWeight: '600' },
});
