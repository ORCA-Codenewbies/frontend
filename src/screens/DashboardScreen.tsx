import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { Header } from '../components/common/Header';
import { LocationSelector } from '../components/common/LocationSelector';

import { Greeting } from '../components/dashboard/Greeting';
import { QuickQuestions } from '../components/dashboard/QuickQuestions';
import { PromptInput } from '../components/common/PromptInput';

export const DashboardScreen: React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.safeArea}
    >
      <ImageBackground
        source={require('../assets/Images/orca-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.flexContainer}>
          {/* 1. HEADER (Logo + Hamburger, compact and clean, no profile icon) */}
          <Header />

          {/* 2. LOCATION (Small single-line location selector) */}
          <LocationSelector />

          {/* Scrollable Content Body */}
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Section: Marine Alert + Greeting */}
            <View style={styles.topSection}>
              {/* 3. CONDITIONAL MARINE ALERT (REMOVED - Replaced globally) */}

              {/* 4. GREETING ("Hi, how can I help you today?") */}
              <Greeting />
            </View>

            {/* 5. QUICK QUESTIONS (Positioned naturally in lower ocean area above Ask ORCA bar) */}
            <View style={styles.quickQuestionsSection}>
              <QuickQuestions />
            </View>
          </ScrollView>

          {/* 6. ASK ORCA PROMPT (Prominent pill input with mic + blue circular send arrow) */}
          <PromptInput placeholder="Ask ORCA about the sea, fishing or weather..." />
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flexContainer: {
    flex: 1,
  },
  scrollBody: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  topSection: {
    width: '100%',
  },
  quickQuestionsSection: {
    width: '100%',
    paddingBottom: 8,
  },
});
