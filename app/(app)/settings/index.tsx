import { View, Text, StyleSheet, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { usePartnerStore } from '@/stores/partnerStore';
import { colors, radius, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const profile = usePartnerStore((s) => s.profile);
  const toggleStoreOpen = usePartnerStore((s) => s.toggleStoreOpen);

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScreenWrapper>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <SettingRow label="Name" value={profile?.businessDetails?.fullName ?? profile?.name ?? '-'} />
          <SettingRow label="Mobile" value={profile?.businessDetails?.mobile ?? '-'} />
          <SettingRow label="Email" value={profile?.businessDetails?.email ?? '-'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <SettingRow label="Business Name" value={profile?.businessDetails?.businessName ?? '-'} />
          <SettingRow label="Business Type" value={profile?.businessDetails?.businessType ?? '-'} />
          <SettingRow label="GST" value={profile?.businessDetails?.gstNumber ?? 'Not provided'} />
          <SettingRow label="PAN" value={profile?.businessDetails?.panNumber ?? 'Not provided'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Settings</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Store Open / Closed</Text>
            <Switch
              value={profile?.isStoreOpen ?? false}
              onValueChange={toggleStoreOpen}
              trackColor={{ true: colors.successLight, false: colors.border }}
              thumbColor={profile?.isStoreOpen ? colors.success : colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingRow label="New Orders" value="Enabled" />
          <SettingRow label="Low Stock Alerts" value="Enabled" />
          <SettingRow label="Payout Updates" value="Enabled" />
          <SettingRow label="Promotional" value="Disabled" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <SettingRow label="Terms & Conditions" value="View" />
          <SettingRow label="Privacy Policy" value="View" />
        </View>
      </ScreenWrapper>
    </>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { ...typography.body, color: colors.text },
});
