import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProgress } from '@/components/layout/AuthProgress';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, radius, shadows, gradients } from '@/theme';

const CARD_OVERLAP = 28;

const FEATURES = [
  { icon: 'storefront-outline' as const, label: 'Build your store' },
  { icon: 'cube-outline' as const, label: 'Manage products' },
  { icon: 'wallet-outline' as const, label: 'Track earnings' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setPhoneStore = useAuthStore((s) => s.setPhone);

  const isValid = phone.length === 10 && accepted;

  async function handleContinue() {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!accepted) {
      setError('Please accept Terms & Privacy Policy');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      await authService.sendOtp(fullPhone);
      await setPhoneStore(fullPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } catch (err) {
      console.error('[Login] sendOtp failed:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[...gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
          pointerEvents="none"
        >
          <View style={styles.heroOrb1} pointerEvents="none" />
          <View style={styles.heroOrb2} pointerEvents="none" />

          <View style={styles.heroContent} pointerEvents="none">
            <AuthProgress currentStep={1} variant="light" />

            <View style={styles.logoWrap}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>M</Text>
              </View>
              <View style={styles.logoBadge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.heroTitle}>Me2 Partner</Text>
            <Text style={styles.heroSubtitle}>Register and manage your business from one place</Text>

            <View style={styles.featureRow}>
              {FEATURES.map((feature) => (
                <View key={feature.label} style={styles.featurePill}>
                  <Ionicons name={feature.icon} size={14} color="rgba(255,255,255,0.95)" />
                  <Text style={styles.featureText}>{feature.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.card, { marginTop: -CARD_OVERLAP }]}>
          <Text style={styles.cardTitle}>Get started</Text>
          <Text style={styles.cardSubtitle}>Enter your mobile number to receive a one-time password</Text>

          <Text style={styles.label}>Mobile Number</Text>
          <PhoneNumberInput
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              if (error) setError('');
            }}
            error={!!error}
          />

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : (
            <Text style={styles.hint}>We'll send a 6-digit verification code via SMS</Text>
          )}

          <Pressable
            style={styles.terms}
            onPress={() => {
              setAccepted((prev) => !prev);
              if (error) setError('');
            }}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.link}>Terms & Conditions</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={({ pressed }) => [
              styles.ctaWrap,
              !isValid && styles.ctaInactive,
              pressed && isValid && styles.ctaPressed,
              loading && styles.ctaDisabled,
            ]}
          >
            <LinearGradient
              colors={isValid ? [...gradients.primary] : ['#94A3B8', '#CBD5E1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
              pointerEvents="none"
            >
              {loading ? (
                <Text style={styles.ctaText}>Sending OTP...</Text>
              ) : (
                <>
                  <Text style={styles.ctaText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {!isValid && !error && (
            <Text style={styles.ctaHint}>
              {phone.length < 10 ? 'Enter your 10-digit mobile number' : 'Accept terms to continue'}
            </Text>
          )}

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
            <Text style={styles.secureText}>Your number is encrypted and never shared</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: CARD_OVERLAP + spacing.xxxl,
    overflow: 'hidden',
    borderBottomLeftRadius: radius.xl + 8,
    borderBottomRightRadius: radius.xl + 8,
  },
  heroOrb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  heroOrb2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -30,
  },
  heroContent: { zIndex: 1 },
  logoWrap: { alignSelf: 'flex-start', marginBottom: spacing.lg, marginTop: spacing.md },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    maxWidth: '90%',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    zIndex: 10,
    elevation: 10,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? { position: 'relative' as const } : {}),
  },
  cardTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  cardSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  error: { ...typography.caption, color: colors.danger, flex: 1 },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.xs,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  link: { color: colors.primary, fontWeight: '600' },
  ctaWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  ctaInactive: { opacity: 0.85 },
  ctaPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  ctaDisabled: { opacity: 0.7 },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  ctaText: { ...typography.button, color: colors.white },
  ctaHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  secureText: { ...typography.caption, color: colors.textMuted },
});
