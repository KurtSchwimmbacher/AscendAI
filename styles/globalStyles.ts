import { StyleSheet } from 'react-native';

// Color Palette
export const colors = {
  // Primary colors
  black: '#171717',
  grey: '#4D4D4D',
  white: '#DEDEDE',
  red: '#F22B2B',
  
  // Shades and tints
  blackShade: '#0F0F0F',
  blackTint: '#2A2A2A',
  greyShade: '#3A3A3A',
  greyTint: '#6B6B6B',
  whiteShade: '#C4C4C4',
  whiteTint: '#F5F5F5',
  redShade: '#D91A1A',
  redTint: '#FF4A4A',
  
  // Semantic colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#171717',
  textSecondary: '#4D4D4D',
  textMuted: '#6B6B6B',
  border: '#E0E0E0',
  error: '#F22B2B',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Typography
export const typography = {
  title: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: colors.text,
    lineHeight: 44,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.text,
    lineHeight: 40,
  },
  titleMedium: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.text,
    lineHeight: 36,
  },
  titleSmall: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 28,
  },
  subheadingSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 50,
  round: 999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Global Styles
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  contentCentered: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Button styles
  buttonFullWidth: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonFullWidthSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonFullWidthDanger: {
    backgroundColor: colors.red,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonCircular: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonCircularSecondary: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  // Text styles
  textTitle: typography.title,
  textTitleLarge: typography.titleLarge,
  textTitleMedium: typography.titleMedium,
  textTitleSmall: typography.titleSmall,
  textSubheading: typography.subheading,
  textSubheadingSmall: typography.subheadingSmall,
  textBody: typography.body,
  textBodySmall: typography.bodySmall,
  textCaption: typography.caption,
  textButton: typography.button,
  textButtonLarge: typography.buttonLarge,

  // Text colors
  textPrimary: {
    color: colors.text,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  textWhite: {
    color: colors.white,
  },
  textError: {
    color: colors.error,
  },
  textSuccess: {
    color: colors.success,
  },

  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardRounded: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },

  // Input styles
  input: {
    
    borderColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: 16,
    color: colors.text,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.black,
    ...shadows.md,
  },
  inputError: {
    borderColor: colors.error,
  },

  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Spacing utilities
  marginTopXs: { marginTop: spacing.xs },
  marginTopSm: { marginTop: spacing.sm },
  marginTopMd: { marginTop: spacing.md },
  marginTopLg: { marginTop: spacing.lg },
  marginTopXl: { marginTop: spacing.xl },
  marginTopXxl: { marginTop: spacing.xxl },

  marginBottomXs: { marginBottom: spacing.xs },
  marginBottomSm: { marginBottom: spacing.sm },
  marginBottomMd: { marginBottom: spacing.md },
  marginBottomLg: { marginBottom: spacing.lg },
  marginBottomXl: { marginBottom: spacing.xl },
  marginBottomXxl: { marginBottom: spacing.xxl },

  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },
  paddingXxl: { padding: spacing.xxl },

  // Border radius utilities
  roundedSm: { borderRadius: borderRadius.sm },
  roundedMd: { borderRadius: borderRadius.md },
  roundedLg: { borderRadius: borderRadius.lg },
  roundedXl: { borderRadius: borderRadius.xl },
  roundedXxl: { borderRadius: borderRadius.xxl },
  roundedFull: { borderRadius: borderRadius.full },
  roundedRound: { borderRadius: borderRadius.round },
});
