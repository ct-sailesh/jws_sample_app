import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '../config/theme';
import { fontFamily } from '../config/theme/shared';

const LETTERS = ['J', 'S', 'W'];

export interface SplashAnimationProps {
  /** Called once the closing fade-out completes. */
  onFinish: () => void;
}

/**
 * Brief, self-contained brand moment shown right after the native splash
 * screen hides: the "JSW" wordmark pops in letter by letter, an accent line
 * draws in beneath it, then the whole thing fades to reveal the app.
 */
export function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(
    () => ({
      container: { backgroundColor: theme.colors.background },
      letter: { color: theme.colors.ink900 },
      line: { backgroundColor: theme.colors.primary },
    }),
    [theme]
  );
  const letterAnims = useMemo(() => LETTERS.map(() => new Animated.Value(0)), []);
  const lineScale = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.stagger(
        110,
        letterAnims.map((value) =>
          Animated.spring(value, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          })
        )
      ),
      Animated.timing(lineScale, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(280),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 340,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => animation.stop();
  }, [containerOpacity, letterAnims, lineScale, onFinish]);

  return (
    <Animated.View style={[styles.container, dynamic.container, { opacity: containerOpacity }]}>
      <View style={styles.wordRow}>
        {LETTERS.map((letter, index) => (
          <Animated.Text
            key={letter + index}
            style={[
              styles.letter,
              dynamic.letter,
              {
                opacity: letterAnims[index],
                transform: [
                  {
                    translateY: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                  {
                    scale: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <Animated.View style={[styles.line, dynamic.line, { transform: [{ scaleX: lineScale }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordRow: {
    flexDirection: 'row',
  },
  letter: {
    fontFamily: fontFamily.extraBold,
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: 3,
  },
  line: {
    marginTop: 14,
    width: 56,
    height: 4,
    borderRadius: 2,
  },
});
