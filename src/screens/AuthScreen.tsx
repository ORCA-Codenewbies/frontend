import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { OrcaLogo } from '../components/common/OrcaLogo';

export const AuthScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, demoLogin } = useApp();
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const { data, error } = await signInWithEmail(cleanEmail, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Invalid email or password. Please check your credentials.');
          } else {
            setErrorMessage(error.message || 'Failed to sign in.');
          }
        } else if (!data.session) {
          setInfoMessage('Please check your email to confirm your account before signing in.');
        }
      } else {
        const { data, error } = await signUpWithEmail(cleanEmail, password);
        if (error) {
          if (error.message.includes('rate limit')) {
            setErrorMessage('Email signup rate limit exceeded. Please wait a few minutes or use the demo account below.');
          } else {
            setErrorMessage(error.message || 'Failed to create account.');
          }
        } else if (data.session) {
          setInfoMessage('Account created and signed in successfully!');
        } else {
          setInfoMessage('Registration successful! Please check your email inbox to confirm your account.');
          setMode('SIGN_IN');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // SIH Demo: bypass Supabase, enter app directly as demo user
  const handleDemoSignIn = () => {
    demoLogin();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <OrcaLogo size="large" showSubtitle={true} />
          <Text style={styles.tagline}>
            Smart Decision Assistant for Coastal Fishers
          </Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.cardTitle}>
            {mode === 'SIGN_IN' ? 'Sign in to ORCA' : 'Create ORCA Account'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {mode === 'SIGN_IN'
              ? 'Enter your email and password to access sea forecasts & fishing zones'
              : 'Sign up with your email to start receiving real-time marine advisories'}
          </Text>

          {/* Feedback messages */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {infoMessage ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. fisherman@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              editable={!loading}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              editable={!loading}
            />
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'SIGN_IN' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle between Sign In and Sign Up */}
          <TouchableOpacity
            onPress={() => {
              setMode((prev) => (prev === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'));
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            style={styles.toggleModeBtn}
            disabled={loading}
          >
            <Text style={styles.toggleModeText}>
              {mode === 'SIGN_IN'
                ? "New to ORCA? Create an account ›"
                : 'Already have an account? Sign In ›'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>DEVELOPMENT & DEMO</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Real Supabase Demo Login */}
          <TouchableOpacity
            style={styles.demoLoginBtn}
            onPress={handleDemoSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.demoLoginEmoji}>⛵</Text>
            <Text style={styles.demoLoginText}>
              One-Tap Login as Fisherman (Subhash)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNotice}>
          <Text style={styles.noticeText}>
            Official coastal safety partner: INCOIS / IMD marine advisories
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.statusDanger,
    lineHeight: 17,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.accentBlue,
    lineHeight: 17,
    fontWeight: '500',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleModeBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  toggleModeText: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.8,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlueLight,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  demoLoginEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  demoLoginText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  footerNotice: {
    marginTop: 24,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
