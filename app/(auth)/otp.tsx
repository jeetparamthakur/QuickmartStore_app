import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { AuthProgress } from '@/components/layout/AuthProgress';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { authService, partnerService } from '@/services/api';
import { getPostAuthRoute } from '@/services/api/mappers/partnerProfile';
import { useAuthStore } from '@/stores/authStore';
import { usePartnerStore } from '@/stores/partnerStore';
import { syncOnboardingComplete } from '@/utils/syncOnboarding';
import { colors, spacing, typography } from '@/theme';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const setTokens = useAuthStore((s) => s.setTokens);
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
      const { token, refreshToken } = await authService.verifyOtp(phone ?? '', otp);
      await setTokens(token, refreshToken);

      const profile = await partnerService.getProfile();
      setProfile(profile);
      await syncOnboardingComplete(profile);
      router.replace(getPostAuthRoute(profile) as '/');
    } catch (err) {
      console.error('[OTP] verifyOtp failed:', err);
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
        <AuthProgress currentStep={2} />

        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Edit mobile number</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <OTPInput value={otp} onChange={setOtp} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.cta}>
          <Button title="Verify & Continue" onPress={handleVerify} loading={loading} fullWidth />
        </View>

        <Text style={styles.resend} onPress={handleResend}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backText: { ...typography.bodySmall, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  phone: { fontWeight: '600', color: colors.text },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  cta: { marginTop: spacing.md },
  resend: { ...typography.bodySmall, color: colors.primary, textAlign: 'center', marginTop: spacing.xl },
});
