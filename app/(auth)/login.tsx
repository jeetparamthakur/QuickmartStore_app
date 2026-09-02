import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setPhoneStore = useAuthStore((s) => s.setPhone);

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
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper scroll={false} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.title}>Welcome, Partner</Text>
          <Text style={styles.subtitle}>Login to manage your business</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>🇮🇳 +91</Text>
            </View>
            <Input
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              style={styles.phoneInput}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.terms} onPress={() => setAccepted(!accepted)}>
            <Ionicons
              name={accepted ? 'checkbox' : 'square-outline'}
              size={22}
              color={accepted ? colors.primary : colors.textMuted}
            />
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.link}>Terms & Conditions</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginTop: spacing.huge, marginBottom: spacing.xxxl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { fontSize: 32, fontWeight: '700', color: colors.white },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  form: { flex: 1 },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  phoneRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  countryCode: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    height: 50,
  },
  countryText: { ...typography.body, color: colors.text },
  phoneInput: { flex: 1, marginBottom: 0 },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xl },
  termsText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  link: { color: colors.primary, fontWeight: '600' },
});
