import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { VoiceModal } from './VoiceModal';

interface PromptInputProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  placeholder = 'Ask ORCA about the sea, fishing or weather...',
  autoFocus = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const { sendMessage, isAnalyzing } = useApp();

  const handleSend = () => {
    if (!inputText.trim() || isAnalyzing) return;
    const query = inputText.trim();
    setInputText('');
    sendMessage(query);
  };

  const handleVoiceResult = (resultText: string) => {
    sendMessage(resultText);
  };

  const hasText = inputText.trim().length > 0;

  return (
    <>
      <View style={styles.outerContainer}>
        <View style={[styles.pillContainer, hasText && styles.pillActiveBorder]}>
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            textContentType="none"
            keyboardType="default"
            maxLength={300}
            autoFocus={autoFocus}
            editable={!isAnalyzing}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            textAlignVertical="center"
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => setIsVoiceModalVisible(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Voice query"
            >
              <Text style={styles.micIcon}>🎙️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                hasText ? styles.sendButtonActive : styles.sendButtonIdle,
              ]}
              onPress={handleSend}
              disabled={!hasText || isAnalyzing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Send query to ORCA"
            >
              <Text style={styles.sendArrow}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <VoiceModal
        visible={isVoiceModalVisible}
        onClose={() => setIsVoiceModalVisible(false)}
        onVoiceResult={handleVoiceResult}
      />
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 14,
    backgroundColor: 'transparent',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    minHeight: 56,
    paddingLeft: 18,
    paddingRight: 7,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  pillActiveBorder: {
    borderColor: colors.accentBlue,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 44,
    paddingRight: 8,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    textTransform: 'none',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  micIcon: {
    fontSize: 16,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.accentBlue,
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonIdle: {
    backgroundColor: '#93C5FD',
  },
  sendArrow: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
  },
});
