import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supportService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const { data: faqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: supportService.getFaqs,
  });

  const createTicketMutation = useMutation({
    mutationFn: () => supportService.createTicket(ticketSubject, ticketDesc),
    onSuccess: () => {
      setTicketSubmitted(true);
      setShowTicketForm(false);
      setTicketSubject('');
      setTicketDesc('');
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <ScreenWrapper>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('tel:+18001234567')}>
            <Ionicons name="call-outline" size={24} color={colors.primary} />
            <Text style={styles.contactText}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:support@example.com')}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
            <Text style={styles.contactText}>Email Support</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>FAQs</Text>
        {faqs?.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </View>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Raise Support Ticket</Text>
        {ticketSubmitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.successText}>Ticket submitted successfully!</Text>
          </View>
        ) : showTicketForm ? (
          <View style={styles.ticketForm}>
            <Input label="Subject" value={ticketSubject} onChangeText={setTicketSubject} />
            <Input label="Description" value={ticketDesc} onChangeText={setTicketDesc} multiline numberOfLines={4} />
            <Button
              title="Submit Ticket"
              onPress={() => createTicketMutation.mutate()}
              loading={createTicketMutation.isPending}
              fullWidth
            />
          </View>
        ) : (
          <Button title="Raise Support Ticket" onPress={() => setShowTicketForm(true)} variant="secondary" fullWidth />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  contactRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.lg },
  faqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { ...typography.bodyMedium, color: colors.text, flex: 1, marginRight: spacing.md },
  faqAnswer: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.md },
  ticketForm: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  successBox: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.successLight, borderRadius: radius.lg },
  successText: { ...typography.bodyMedium, color: colors.success, marginTop: spacing.sm },
});
