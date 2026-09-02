import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePartnerStore } from '@/stores/partnerStore';
import { kycService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

const documents = [
  { type: 'pan', label: 'PAN Card', required: true },
  { type: 'gst', label: 'GST Certificate', required: false },
  { type: 'business', label: 'Business Document', required: true },
  { type: 'address_proof', label: 'Address Proof', required: true },
];

export default function KycScreen() {
  const setOnboardingStep = usePartnerStore((s) => s.setOnboardingStep);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  async function handleUpload(type: string) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLoading(true);
      try {
        await kycService.uploadDocument(type, result.assets[0].uri);
        setUploaded((u) => ({ ...u, [type]: true }));
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleContinue() {
    setOnboardingStep('bank_setup');
    router.push('/(onboarding)/bank-setup');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'KYC Verification' }} />
      <ScreenWrapper>
        <StepProgress currentStep={4} totalSteps={5} />
        <Text style={styles.title}>KYC & Verification</Text>
        <Text style={styles.subtitle}>Upload documents for verification</Text>

        <StatusBadge label="Pending Verification" variant="warning" />

        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.type}
            style={styles.docCard}
            onPress={() => handleUpload(doc.type)}
          >
            <View style={styles.docInfo}>
              <Ionicons
                name={uploaded[doc.type] ? 'checkmark-circle' : 'document-outline'}
                size={24}
                color={uploaded[doc.type] ? colors.success : colors.textMuted}
              />
              <View style={styles.docText}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.docReq}>{doc.required ? 'Required' : 'Optional'}</Text>
              </View>
            </View>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        ))}

        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth style={styles.btn} />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  docText: {},
  docLabel: { ...typography.bodyMedium, color: colors.text },
  docReq: { ...typography.caption, color: colors.textMuted },
  btn: { marginTop: spacing.lg },
});
