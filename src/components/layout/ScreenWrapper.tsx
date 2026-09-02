import { View, ScrollView, StyleSheet, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function ScreenWrapper({
  children,
  scroll = true,
  padding = true,
  refreshing,
  onRefresh,
  style,
  edges = ['top'],
}: Props) {
  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[padding && styles.padding, style]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding && styles.padding, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  padding: { padding: spacing.lg, paddingBottom: spacing.xxxl },
});
