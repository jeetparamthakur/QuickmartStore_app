import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { InfoSection } from '@/components/profile/InfoSection';
import { InfoRow } from '@/components/profile/InfoRow';
import { colors, radius, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScreenWrapper>
        <InfoSection title="Notifications">
          <InfoRow icon="receipt-outline" label="New Orders" value="Enabled" />
          <InfoRow icon="cube-outline" label="Low Stock Alerts" value="Enabled" />
          <InfoRow icon="wallet-outline" label="Payout Updates" value="Enabled" />
          <InfoRow icon="megaphone-outline" label="Promotional" value="Disabled" isLast />
        </InfoSection>

        <InfoSection title="Legal">
          <InfoRow icon="document-text-outline" label="Terms & Conditions" value="View" />
          <InfoRow icon="shield-outline" label="Privacy Policy" value="View" isLast />
        </InfoSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Quickmart Partner App</Text>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: { ...typography.caption, color: colors.textMuted },
});
