import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import {
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_DESCRIPTIONS,
  type PartnerType,
} from '@/types/partner';
import { colors, radius, spacing, typography, shadows } from '@/theme';

const partnerTypes: { type: PartnerType; icon: keyof typeof Ionicons.glyphMap; emoji: string }[] = [
  { type: 'STORE', icon: 'storefront', emoji: '🏪' },
  { type: 'INDEPENDENT_SELLER', icon: 'bag-handle', emoji: '🛍' },
  { type: 'BRAND', icon: 'business', emoji: '🏢' },
  { type: 'DARK_STORE', icon: 'flash', emoji: '⚡' },
];

export default function PartnerTypeScreen() {
  const setPartnerType = usePartnerStore((s) => s.setPartnerType);
  const currentType = usePartnerStore((s) => s.profile?.partnerType);

  function handleSelect(type: PartnerType) {
    setPartnerType(type);
  }

  function handleContinue() {
    router.push('/(onboarding)/business-details');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Choose Partner Type' }} />
      <ScreenWrapper>
        <StepProgress currentStep={1} totalSteps={5} />
        <Text style={styles.title}>Choose Your Partner Type</Text>
        <Text style={styles.subtitle}>Select the option that best describes your business</Text>

        {partnerTypes.map(({ type, emoji }) => (
          <TouchableOpacity
            key={type}
            style={[styles.card, currentType === type && styles.cardSelected]}
            onPress={() => handleSelect(type)}
            activeOpacity={0.9}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{PARTNER_TYPE_LABELS[type]}</Text>
              <Text style={styles.cardDesc}>{PARTNER_TYPE_DESCRIPTIONS[type]}</Text>
            </View>
            {currentType === type && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}

        <Button title="Continue" onPress={handleContinue} fullWidth style={styles.btn} />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  emoji: { fontSize: 28, marginRight: spacing.md },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text },
  cardDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  btn: { marginTop: spacing.lg },
});
