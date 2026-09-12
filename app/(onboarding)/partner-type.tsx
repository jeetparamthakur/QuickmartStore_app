import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { AuthProgress } from '@/components/layout/AuthProgress';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import { onboardingService } from '@/services/api';
import {
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_DESCRIPTIONS,
  PARTNER_TYPE_BENEFITS,
  type PartnerType,
} from '@/types/partner';
import { colors, radius, spacing, typography, shadows } from '@/theme';

const SELLER_TYPES: PartnerType[] = ['STORE', 'INDEPENDENT_SELLER'];

const PARTNER_ICONS: Record<PartnerType, keyof typeof Ionicons.glyphMap> = {
  STORE: 'storefront-outline',
  INDEPENDENT_SELLER: 'person-outline',
  BRAND: 'business-outline',
  DARK_STORE: 'flash-outline',
};

export default function PartnerTypeScreen() {
  const setPartnerType = usePartnerStore((s) => s.setPartnerType);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const currentType = usePartnerStore((s) => s.profile?.partnerType) ?? 'STORE';
  const [selectedType, setSelectedType] = useState<PartnerType>(
    SELLER_TYPES.includes(currentType) ? currentType : 'STORE'
  );
  const [loading, setLoading] = useState(false);

  function handleTabChange(type: PartnerType) {
    setSelectedType(type);
  }

  async function handleContinue() {
    setPartnerType(selectedType);
    setLoading(true);
    try {
      const profile = await onboardingService.update({
        partnerType: selectedType,
        onboardingStep: 'business_details',
      });
      setProfile(profile);
      router.push('/(onboarding)/business-details');
    } catch {
      Alert.alert('Error', 'Could not save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const benefits = PARTNER_TYPE_BENEFITS[selectedType];

  return (
    <>
      <Stack.Screen options={{ title: 'Choose Seller Type', headerShown: false }} />
      <ScreenWrapper>
        <AuthProgress currentStep={3} />

        <Text style={styles.title}>How do you want to sell?</Text>
        <Text style={styles.subtitle}>Choose the path that fits your business</Text>

        <SegmentedControl
          options={[
            { value: 'STORE', label: PARTNER_TYPE_LABELS.STORE },
            { value: 'INDEPENDENT_SELLER', label: PARTNER_TYPE_LABELS.INDEPENDENT_SELLER },
          ]}
          value={selectedType}
          onChange={handleTabChange}
        />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name={PARTNER_ICONS[selectedType]} size={28} color={colors.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{PARTNER_TYPE_LABELS[selectedType]}</Text>
              <Text style={styles.cardDesc}>{PARTNER_TYPE_DESCRIPTIONS[selectedType]}</Text>
            </View>
          </View>

          <View style={styles.benefits}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth style={styles.btn} />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  cardDesc: { ...typography.bodySmall, color: colors.textSecondary },
  benefits: { gap: spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitText: { ...typography.bodySmall, color: colors.text, flex: 1 },
  btn: { marginTop: spacing.xl },
});
