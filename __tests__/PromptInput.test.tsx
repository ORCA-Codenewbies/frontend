import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PromptInput } from '../src/components/common/PromptInput';

// Mock useApp to prevent rendering AppProvider which has async side-effects
jest.mock('../src/context/AppContext', () => ({
  useApp: () => ({
    sendMessage: jest.fn(),
    isAnalyzing: false,
    currentLocation: { name: 'Digha' },
  }),
}));

describe('PromptInput Casing & Multi-Input Typing Verification', () => {
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 47, left: 0, right: 0, bottom: 34 },
  };

  it('configures TextInput with autoCapitalize="none", autoCorrect=false, spellCheck=false', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    expect(textInput.props.autoCapitalize).toBe('none');
    expect(textInput.props.autoCorrect).toBe(false);
    expect(textInput.props.spellCheck).toBe(false);
  });

  it('Test Case 1: preserves all-lowercase typed inputs ("digha sea weather")', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      textInput.props.onChangeText('digha sea weather');
    });

    const updatedInput = renderer!.root.findByType(TextInput);
    expect(updatedInput.props.value).toBe('digha sea weather');
  });

  it('Test Case 2: preserves mixed-case sentences ("Kal Digha e maach dhorte jabo?")', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      textInput.props.onChangeText('Kal Digha e maach dhorte jabo?');
    });

    const updatedInput = renderer!.root.findByType(TextInput);
    expect(updatedInput.props.value).toBe('Kal Digha e maach dhorte jabo?');
  });

  it('Test Case 3: preserves all-uppercase acronyms and coordinates ("ORCA PFZ HOTSPOT GPS 21.482N")', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      textInput.props.onChangeText('ORCA PFZ HOTSPOT GPS 21.482N');
    });

    const updatedInput = renderer!.root.findByType(TextInput);
    expect(updatedInput.props.value).toBe('ORCA PFZ HOTSPOT GPS 21.482N');
  });

  it('Test Case 4: preserves mixed technical coordinates & symbols ("21°48\'N, 87°72\'E - depth 25m")', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      textInput.props.onChangeText("21°48'N, 87°72'E - depth 25m");
    });

    const updatedInput = renderer!.root.findByType(TextInput);
    expect(updatedInput.props.value).toBe("21°48'N, 87°72'E - depth 25m");
  });

  it('Test Case 5: preserves transliterated query without auto-casing ("ami achi digha r kache")', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PromptInput />
        </SafeAreaProvider>
      );
    });

    const textInput = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      textInput.props.onChangeText('ami achi digha r kache');
    });

    const updatedInput = renderer!.root.findByType(TextInput);
    expect(updatedInput.props.value).toBe('ami achi digha r kache');
  });
});
