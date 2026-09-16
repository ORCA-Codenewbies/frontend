import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ResponseSegment } from '../../types/orca';

interface OrcaResponseBubbleProps {
    text: string;
    segments?: ResponseSegment[];
}

const getHighlightStyle = (agent: string) => {
    const name = agent.toLowerCase();
    if (name.includes('pfz')) {
        return styles.highlightOrange;
    }
    if (name.includes('weather')) {
        return styles.highlightGreen;
    }
    return styles.highlightBlue;
};

export const OrcaResponseBubble: React.FC<OrcaResponseBubbleProps> = ({
    text,
    segments,
}) => {
    if (!text) return null;

    if (!segments || segments.length === 0) {
        return (
            <View style={styles.bubble}>
                <Text style={styles.text}>{text}</Text>
            </View>
        );
    }

    return (
        <View style={styles.bubble}>
            <Text style={styles.text}>
                {segments.map((segment, index) => {
                    const attributed = segment.agents && segment.agents.length > 0;

                    if (!attributed) {
                        return <Text key={segment.id || index}>{segment.text}</Text>;
                    }

                    const primaryAgent = segment.agents[0];

                    return (
                        <Text
                            key={segment.id || index}
                            style={getHighlightStyle(primaryAgent)}
                        >
                            {segment.text}
                        </Text>
                    );
                })}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        paddingVertical: 13,
        paddingHorizontal: 16,
        width: '100%',
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    text: {
        fontSize: 15,
        lineHeight: 24, // Slightly taller line-height to accommodate inline backgrounds
        fontWeight: '400',
        color: colors.textPrimary,
    },
    highlightBlue: {
        backgroundColor: '#E0F2FE', // Light blue background
        color: '#0369A1',
        overflow: 'hidden',
    },
    highlightOrange: {
        backgroundColor: '#FEF3C7', // Light orange/yellow background
        color: '#92400E',
        overflow: 'hidden',
    },
    highlightGreen: {
        backgroundColor: '#DCFCE7', // Light green background
        color: '#166534',
        overflow: 'hidden',
    },
});