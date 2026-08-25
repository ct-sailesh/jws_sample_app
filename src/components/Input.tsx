import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

export interface InputProps extends TextInputProps {
  label?: string;
  mono?: boolean;
}

/** Bordered text field; focus state swaps the hairline border for the brand blue, as in the prototype. */
export function Input({ label, mono, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[theme.type.bodySm, dynamic.label]}>{label}</Text> : null}
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.ink400}
        style={[
          styles.input,
          dynamic.input,
          mono ? theme.type.monoLg : theme.type.body,
          focused && dynamic.focused,
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
  },
});

function dynamicStyles(theme: Theme) {
  return {
    label: { color: theme.colors.ink600 },
    input: {
      borderColor: theme.colors.border,
      color: theme.colors.ink900,
      backgroundColor: theme.colors.surface,
    },
    focused: { borderColor: theme.colors.primary },
  };
}
