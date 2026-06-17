// app/components/AddSubscriptionModal.tsx
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { rootApi } from '../utils/axiosInstance';

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSubscriptionModal({ visible, onClose, onSuccess }: AddSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subName: '',
    subDescription: '',
    price: '',
    durationDays: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!formData.subName.trim()) {
      setError('Please enter subscription name');
      return;
    }
    if (!formData.subDescription.trim()) {
      setError('Please enter description');
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      setError('Please enter valid duration');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await rootApi.post('/api/admin/create/subscription', {
        subName: formData.subName,
        subDescription: formData.subDescription,
        price: parseInt(formData.price),
        durationDays: parseInt(formData.durationDays),
      });

      // Reset form
      setFormData({
        subName: '',
        subDescription: '',
        price: '',
        durationDays: '',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      setError(error.response?.data?.message || 'Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-900">Create Subscription</Text>
            <Pressable onPress={onClose} className="p-1">
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Form */}
          <View className="p-5 gap-4">
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            ) : null}

            <View>
              <Text className="text-slate-700 font-semibold mb-2">Subscription Name</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="e.g., Premium Monthly"
                placeholderTextColor="#94a3b8"
                value={formData.subName}
                onChangeText={(text) => setFormData({ ...formData, subName: text })}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className="text-slate-700 font-semibold mb-2">Description</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="Describe the subscription benefits"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                value={formData.subDescription}
                onChangeText={(text) => setFormData({ ...formData, subDescription: text })}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className="text-slate-700 font-semibold mb-2">Price (USD)</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="e.g., 9.99"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className="text-slate-700 font-semibold mb-2">Duration (Days)</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                placeholder="e.g., 30"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={formData.durationDays}
                onChangeText={(text) => setFormData({ ...formData, durationDays: text })}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row gap-3 p-5 border-t border-slate-100">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200"
              disabled={isLoading}
            >
              <Text className="text-slate-700 font-medium text-center">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-teal-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium text-center">Create</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}