import { useState } from 'react';
import { View, Text, StyleSheet, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { AuthProgress } from '@/components/layout/AuthProgress';
import { PartnerTypeCard } from '@/components/onboarding/PartnerTypeCard';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import { onboardingService } from '@/services/api';
import {
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_DESCRIPTIONS,
  PARTNER_TYPE_BENEFITS,
  type PartnerType,
} from '@/types/partner';
import {
  ONBOARDING_PARTNER_TYPES,
  isOnboardingPartnerType,
} from '@/constants/partnerTypes';
import { colors, radius, spacing, typography, shadows, gradients } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PARTNER_ICONS: Record<PartnerType, keyof typeof Ionicons.glyphMap> = {
  STORE: 'storefront-outline',
  INDEPENDENT_SELLER: 'person-outline',
  FOOD_STORE: 'restaurant-outline',
  BRAND: 'business-outline',
  DARK_STORE: 'flash-outline',
};

const TYPE_ACCENTS: Record<
  (typeof ONBOARDING_PARTNER_TYPES)[number],
  { accent: string; accentMuted: string }
> = {
  STORE: { accent: colors.primary, accentMuted: colors.primaryLight },
  FOOD_STORE: { accent: '#C2410C', accentMuted: '#FFF7ED' },
};

function animateSelection() {
  LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
}

export default function PartnerTypeScreen() {
  const setPartnerType = usePartnerStore((s) => s.setPartnerType);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const currentType = usePartnerStore((s) => s.profile?.partnerType) ?? 'STORE';
  const [selectedType, setSelectedType] = useState<PartnerType>(
    isOnboardingPartnerType(currentType) ? currentType : 'STORE'
  );
  const [loading, setLoading] = useState(false);

  function handleSelect(type: PartnerType) {
    if (type === selectedType) return;
    animateSelection();
    setSelectedType(type);
  }

  async function handleContinue() {
    if (!isOnboardingPartnerType(selectedType)) {
      Alert.alert('Invalid selection', 'Please choose Store or Food / Restaurant.');
      return;
    }
    setPartnerType(selectedType);
    setLoading(true);
    try {
      const profile = await onboardingService.update({
        partnerType: selectedType,
        onboardingStep: 'business_details',
      });
      setProfile(profile);
      router.replace('/(onboarding)/business-details');
    } catch {
      Alert.alert('Error', 'Could not save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const benefits = PARTNER_TYPE_BENEFITS[selectedType];
  const accent = TYPE_ACCENTS[selectedType as (typeof ONBOARDING_PARTNER_TYPES)[number]];

  return (
    <>
      <Stack.Screen options={{ title: 'Choose Seller Type', headerShown: false }} />
      <ScreenWrapper>
        <AuthProgress currentStep={3} />

        <LinearGradient
          colors={[...gradients.hero]}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>How do you want to sell?</Text>
          <Text style={styles.heroSubtitle}>
            Pick the experience built for your business. You can set up details in the next steps.
          </Text>
        </LinearGradient>

        <View style={styles.cardsColumn}>
          {ONBOARDING_PARTNER_TYPES.map((type) => {
            const { accent: typeAccent, accentMuted } = TYPE_ACCENTS[type];
            return (
              <PartnerTypeCard
                key={type}
                title={PARTNER_TYPE_LABELS[type]}
                description={PARTNER_TYPE_DESCRIPTIONS[type]}
                icon={PARTNER_ICONS[type]}
                selected={selectedType === type}
                accent={typeAccent}
                accentMuted={accentMuted}
                onPress={() => handleSelect(type)}
              />
            );
          })}
        </View>

        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <View style={[styles.benefitsIconWrap, { backgroundColor: accent.accentMuted }]}>
              <Ionicons name={PARTNER_ICONS[selectedType]} size={20} color={accent.accent} />
            </View>
            <View style={styles.benefitsHeaderText}>
              <Text style={styles.benefitsTitle}>What you get</Text>
              <Text style={styles.benefitsSubtitle}>With {PARTNER_TYPE_LABELS[selectedType]}</Text>
            </View>
          </View>

          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={benefit} style={[styles.benefitRow, index < benefits.length - 1 && styles.benefitRowBorder]}>
                <View style={[styles.benefitBullet, { backgroundColor: accent.accentMuted }]}>
                  <Ionicons name="checkmark" size={14} color={accent.accent} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          title={`Continue as ${PARTNER_TYPE_LABELS[selectedType]}`}
          onPress={handleContinue}
          loading={loading}
          fullWidth
          style={styles.btn}
        />
        <Text style={styles.footerHint}>Need help choosing? Store is for product catalogs; Food is for menus and kitchen orders.</Text>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardsColumn: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  benefitsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsHeaderText: { flex: 1 },
  benefitsTitle: { ...typography.label, color: colors.text, fontWeight: '700' },
  benefitsSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  benefitsList: { gap: 0 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  benefitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  benefitBullet: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  benefitText: { ...typography.bodySmall, color: colors.text, flex: 1, lineHeight: 20 },
  btn: { marginTop: spacing.sm },
  footerHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
});
