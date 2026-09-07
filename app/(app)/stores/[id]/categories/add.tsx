import { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { categoriesService } from '@/services/api';

export default function AddCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const createMutation = useMutation({
    mutationFn: () => categoriesService.create(id!, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
      router.back();
    },
    onError: (error: Error) => Alert.alert('Error', error.message),
  });

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    createMutation.mutate();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Category' }} />
      <ScreenWrapper>
        <Input
          label="Category Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Dairy, Snacks, Beverages"
          autoFocus
        />
        <Button
          title="Save Category"
          onPress={handleSave}
          loading={createMutation.isPending}
          fullWidth
        />
      </ScreenWrapper>
    </>
  );
}
