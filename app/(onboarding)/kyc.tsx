import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerStore } from '@/stores/partnerStore';
import { kycService, onboardingService } from '@/services/api';
import { ApiError } from '@/services/api/client';
import type { KycStatus } from '@/types/index';
import type { PartnerType } from '@/types/partner';
import { colors, radius, spacing, typography } from '@/theme';

function getPreviousStepRoute(partnerType?: PartnerType) {
  if (partnerType === 'FOOD_STORE') return '/(onboarding)/food-setup';
  if (partnerType === 'INDEPENDENT_SELLER') return '/(onboarding)/seller-setup';
  return '/(onboarding)/store-details';
}

const documents = [
  { type: 'pan', label: 'PAN Card', required: true },
  { type: 'gst', label: 'GST Certificate', required: false },
  { type: 'business', label: 'Business Document', required: true },
  { type: 'address_proof', label: 'Address Proof', required: true },
];

const STATUS_VARIANT: Record<KycStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  under_review: 'info',
  approved: 'success',
  rejected: 'danger',
};

export default function KycScreen() {
  const setProfile = usePartnerStore((s) => s.setProfile);
  const partnerType = usePartnerStore((s) => s.profile?.partnerType);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [kycStatus, setKycStatus] = useState<KycStatus>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const status = await kycService.getStatus();
      setKycStatus(status.status);
      setRejectionReason(status.rejectionReason);
      const map: Record<string, boolean> = {};
      status.documents.forEach((doc) => {
        map[doc.type] = true;
      });
      setUploaded(map);
    } catch {
      // keep local state if fetch fails
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

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
        if (kycStatus === 'rejected') {
          setKycStatus('pending');
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Could not upload document. Please try again.';
        Alert.alert('Upload failed', message);
      } finally {
        setLoading(false);
      }
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(getPreviousStepRoute(partnerType));
  }

  async function handleContinue() {
    const missing = documents.filter((d) => d.required && !uploaded[d.type]);
    if (missing.length > 0) {
      Alert.alert('Required documents', `Please upload: ${missing.map((d) => d.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await kycService.submit();
      const updated = await onboardingService.update({ onboardingStep: 'bank_setup' });
      setProfile(updated);
      router.push('/(onboarding)/bank-setup');
    } catch {
      Alert.alert('Submission failed', 'Could not submit KYC documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'KYC Verification' }} />
      <ScreenWrapper>
        <TouchableOpacity style={styles.backRow} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <StepProgress currentStep={4} totalSteps={5} />
        <Text style={styles.title}>KYC & Verification</Text>
        <Text style={styles.subtitle}>
          Upload documents. Files are stored securely and sent to admin for manual approval.
        </Text>

        {initialLoading ? (
          <Skeleton height={28} width={160} style={{ marginBottom: spacing.lg }} />
        ) : (
          <StatusBadge
            label={kycStatus.replace('_', ' ').toUpperCase()}
            variant={STATUS_VARIANT[kycStatus]}
          />
        )}

        {rejectionReason && kycStatus === 'rejected' && (
          <Text style={styles.rejection}>{rejectionReason}</Text>
        )}

        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.type}
            style={styles.docCard}
            onPress={() => handleUpload(doc.type)}
            disabled={loading}
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  backText: { ...typography.bodySmall, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  rejection: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
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
