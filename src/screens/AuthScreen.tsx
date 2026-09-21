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
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { OrcaLogo } from '../components/common/OrcaLogo';

type AuthMode = 'SIGN_IN' | 'SIGN_UP' | 'CHECK_EMAIL';

export const AuthScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, resendVerificationEmail, signInWithGoogle } = useApp();
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  // Track the email used for signup so the CHECK_EMAIL screen can show it
  const [signupEmail, setSignupEmail] = useState('');
  // Track whether an unverified-user error occurred during sign-in (to offer resend)
  const [showResendOnSignIn, setShowResendOnSignIn] = useState(false);

  // ── Helpers to detect unverified-user errors ──
  const isUnverifiedError = (message: string): boolean => {
    const lower = message.toLowerCase();
    return (
      lower.includes('email not confirmed') ||
      lower.includes('email_not_confirmed') ||
      lower.includes('confirm your email') ||
      lower.includes('not been verified') ||
      lower.includes('email confirmation')
    );
  };

  // ── SIGN IN ──
  const handleSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setShowResendOnSignIn(false);

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
      const { error } = await signInWithEmail(cleanEmail, password);
      if (error) {
        const msg: string = error.message || '';
        if (isUnverifiedError(msg)) {
          setErrorMessage(
            'Please verify your email address before signing in. Check your inbox for the confirmation link.'
          );
          setSignupEmail(cleanEmail);
          setShowResendOnSignIn(true);
        } else if (msg.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please check your credentials.');
        } else {
          setErrorMessage(msg || 'Failed to sign in.');
        }
      }
      // On success, the auth state listener in AppContext navigates to DASHBOARD automatically.
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN UP ──
  const handleSignUp = async () => {
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
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUpWithEmail(cleanEmail, password);
      if (error) {
        const msg: string = error.message || '';
        if (msg.toLowerCase().includes('rate limit')) {
          setErrorMessage(
            'Email signup rate limit exceeded. Please wait a few minutes and try again.'
          );
        } else if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
          setErrorMessage(
            'An account with this email already exists. Please sign in instead.'
          );
        } else {
          setErrorMessage(msg || 'Failed to create account.');
        }
      } else {
        // Signup succeeded — transition to CHECK_EMAIL state.
        // Do NOT navigate to Dashboard. User must confirm their email first.
        setSignupEmail(cleanEmail);
        setMode('CHECK_EMAIL');
        setErrorMessage(null);
        setInfoMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── GOOGLE SIGN IN ──
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setShowResendOnSignIn(false);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Failed to sign in with Google.');
      }
      // On success, the browser opens, user logs in, redirects to deep link, AppContext handles exchange.
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND VERIFICATION EMAIL ──
  const handleResendVerification = async (targetEmail?: string) => {
    const emailToResend = (targetEmail || signupEmail).trim();
    if (!emailToResend) return;

    setResendLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const { error } = await resendVerificationEmail(emailToResend);
      if (error) {
        const msg: string = error.message || '';
        if (msg.toLowerCase().includes('rate limit')) {
          setErrorMessage('Please wait a few minutes before requesting another email.');
        } else {
          setErrorMessage(msg || 'Failed to resend verification email.');
        }
      } else {
        setInfoMessage('Verification email sent again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── MODE SWITCH ──
  const switchToSignIn = () => {
    setMode('SIGN_IN');
    setErrorMessage(null);
    setInfoMessage(null);
    setShowResendOnSignIn(false);
    setPassword('');
    setConfirmPassword('');
  };

  const switchToSignUp = () => {
    setMode('SIGN_UP');
    setErrorMessage(null);
    setInfoMessage(null);
    setShowResendOnSignIn(false);
    setPassword('');
    setConfirmPassword('');
  };

  // ══════════════════════════════════════════════════
  // RENDER: CHECK_EMAIL state
  // ══════════════════════════════════════════════════
  if (mode === 'CHECK_EMAIL') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <OrcaLogo size="large" showSubtitle={true} />
          </View>

          <View style={styles.authCard}>
            <Text style={styles.cardTitle}>Check your email</Text>
            <Text style={styles.cardSubtitle}>
              We sent a confirmation link to:
            </Text>
            <Text style={styles.emailHighlight}>{signupEmail}</Text>
            <Text style={styles.cardSubtitle}>
              Open your email and tap the confirmation link to verify your account.
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

            {/* Resend Verification Email */}
            <TouchableOpacity
              style={[styles.primaryButton, resendLoading && styles.buttonDisabled]}
              onPress={() => handleResendVerification()}
              activeOpacity={0.8}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Resend Verification Email</Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={switchToSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            {/* Instruction note */}
            <Text style={styles.noteText}>
              After confirming your email, return here and sign in with your email and password.
            </Text>
          </View>

          <View style={styles.footerNotice}>
            <Text style={styles.noticeText}>
              Official coastal safety partner: INCOIS / IMD marine advisories
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════
  // RENDER: SIGN_IN / SIGN_UP
  // ══════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <OrcaLogo size="large" showSubtitle={true} />
            <Text style={styles.tagline}>
              Smart Decision Assistant for Coastal Fishers
            </Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.cardTitle}>
              {mode === 'SIGN_IN' ? 'Welcome back' : 'Create your ORCA account'}
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

            {/* Resend button shown on sign-in when user's email is unverified */}
            {showResendOnSignIn ? (
              <TouchableOpacity
                style={[styles.resendInlineButton, resendLoading && styles.buttonDisabled]}
                onPress={() => handleResendVerification(signupEmail)}
                activeOpacity={0.8}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator color={colors.accentBlue} size="small" />
                ) : (
                  <Text style={styles.resendInlineText}>Resend Verification Email</Text>
                )}
              </TouchableOpacity>
            ) : null}

            {/* Email input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
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
                  if (showResendOnSignIn) setShowResendOnSignIn(false);
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

            {/* Confirm Password (Sign Up only) */}
            {mode === 'SIGN_UP' ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  editable={!loading}
                />
              </View>
            ) : null}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={mode === 'SIGN_IN' ? handleSignIn : handleSignUp}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'SIGN_IN' ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.googleButtonIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Toggle between Sign In and Sign Up */}
            <TouchableOpacity
              onPress={mode === 'SIGN_IN' ? switchToSignUp : switchToSignIn}
              style={styles.toggleModeBtn}
              disabled={loading}
            >
              <Text style={styles.toggleModeText}>
                {mode === 'SIGN_IN'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footerNotice}>
            <Text style={styles.noticeText}>
              Official coastal safety partner: INCOIS / IMD marine advisories
            </Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
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
  emailHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentBlue,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
    fontStyle: 'italic',
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
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surfaceAlt,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  resendInlineButton: {
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    backgroundColor: colors.accentBlueLight,
  },
  resendInlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  googleButtonIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
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
