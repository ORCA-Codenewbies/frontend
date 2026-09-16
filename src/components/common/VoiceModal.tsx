import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';

interface VoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onVoiceResult: (simulatedText: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  visible,
  onClose,
  onVoiceResult,
}) => {
  const [waveAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visible, waveAnim]);

  const handleSimulateBengaliQuery = () => {
    onVoiceResult('Kal Digha e maach dhorte jabo, kemon hobe?');
    onClose();
  };

  const handleSimulatePFZQuery = () => {
    onVoiceResult('ami achi digha r kache ebr kothai bhalo mach dhora hobe bolo');
    onClose();
  };

  const handleSimulateSafetyQuery = () => {
    onVoiceResult('Is the sea safe today?');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          <Text style={styles.listeningTitle}>Listening...</Text>
          <Text style={styles.listeningSubtitle}>
            Speak in Bengali, Hindi, Odia, or English
          </Text>

          <Animated.View
            style={[
              styles.micCircle,
              {
                transform: [{ scale: waveAnim }],
              },
            ]}
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </Animated.View>

          <View style={styles.quickVoiceSamples}>
            <Text style={styles.samplesTitle}>Or tap a sample query:</Text>
            <TouchableOpacity
              style={styles.sampleChip}
              onPress={handleSimulateBengaliQuery}
            >
              <Text style={styles.sampleChipText}>
                "Kal Digha e maach dhorte jabo, kemon hobe?"
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleChip}
              onPress={handleSimulatePFZQuery}
            >
              <Text style={styles.sampleChipText}>
                "ami achi digha r kache ebr kothai bhalo mach dhora hobe bolo"
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleChip}
              onPress={handleSimulateSafetyQuery}
            >
              <Text style={styles.sampleChipText}>
                "Is the sea safe today?"
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 45, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  listeningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  listeningSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: colors.accentBlue,
  },
  micIcon: {
    fontSize: 36,
  },
  quickVoiceSamples: {
    width: '100%',
    marginBottom: 18,
  },
  samplesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sampleChip: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sampleChipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
