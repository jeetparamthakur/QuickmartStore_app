import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { authService, partnerService } from '@/services/api';
import { useAuthStore, isOnboardingComplete } from '@/stores/authStore';
import { usePartnerStore } from '@/stores/partnerStore';
import { colors, spacing, typography } from '@/theme';
import type { PartnerProfile } from '@/types/partner';

const newPartnerProfile: PartnerProfile = {
  id: 'partner-new',
  partnerType: 'STORE',
  approvalStatus: 'pending',
  onboardingStep: 'partner_type',
  isStoreOpen: false,
  name: '',
};

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const setToken = useAuthStore((s) => s.setToken);
  const setProfile = usePartnerStore((s) => s.setProfile);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  async function handleVerify() {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token } = await authService.verifyOtp(phone ?? '', otp);
      await setToken(token);

      const onboardingDone = await isOnboardingComplete();
      if (!onboardingDone) {
        setProfile(newPartnerProfile);
        router.replace('/(onboarding)/partner-type');
        return;
      }

      try {
        const profile = await partnerService.getProfile();
        setProfile(profile);
        if (profile.approvalStatus === 'approved') {
          router.replace('/(app)/(tabs)');
        } else {
          router.replace('/(onboarding)/pending-approval');
        }
      } catch {
        setProfile(newPartnerProfile);
        router.replace('/(onboarding)/partner-type');
      }
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    await authService.sendOtp(phone ?? '');
    setResendTimer(30);
  }

  return (
    <ScreenWrapper scroll={false} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <OTPInput value={otp} onChange={setOtp} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Verify & Continue" onPress={handleVerify} loading={loading} fullWidth />

        <Text style={styles.resend} onPress={handleResend}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.huge },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  phone: { fontWeight: '600', color: colors.text },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  resend: { ...typography.bodySmall, color: colors.primary, textAlign: 'center', marginTop: spacing.xl },
});
