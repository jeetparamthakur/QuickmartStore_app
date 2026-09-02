import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { notificationsService } from '@/services/api';
import type { NotificationType } from '@/types/index';
import { colors, radius, spacing, typography } from '@/theme';

const typeIcons: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  new_order: 'receipt',
  order_cancelled: 'close-circle',
  low_stock: 'warning',
  product_approved: 'checkmark-circle',
  product_rejected: 'close-circle',
  payout: 'cash',
  announcement: 'megaphone',
  promotional: 'gift',
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScreenWrapper scroll={false}>
        {!notifications?.length ? (
          <EmptyState icon="notifications-outline" title="No Notifications" message="You're all caught up!" />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, !item.read && styles.unread]}
                onPress={() => !item.read && markReadMutation.mutate(item.id)}
              >
                <View style={[styles.iconWrap, !item.read && styles.iconUnread]}>
                  <Ionicons name={typeIcons[item.type]} size={20} color={colors.primary} />
                </View>
                <View style={styles.content}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </Text>
                </View>
                {!item.read && <View style={styles.dot} />}
              </TouchableOpacity>
            )}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxxl },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  unread: { backgroundColor: '#F8FAFF' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: { backgroundColor: '#EEF2FF' },
  content: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.bodyMedium, color: colors.text },
  message: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  time: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});
