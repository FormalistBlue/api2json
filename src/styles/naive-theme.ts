import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

export const naiveDarkTheme = darkTheme

const common = {
  primaryColor: '#14b8a6',
  primaryColorHover: '#2dd4bf',
  primaryColorPressed: '#0f766e',
  primaryColorSuppl: '#14b8a6',
  borderRadius: '10px',
  fontFamily: 'Outfit, Segoe UI, sans-serif',
  fontFamilyMono: 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
}

export const naiveDarkThemeOverrides: GlobalThemeOverrides = {
  common,
  Button: { borderRadiusMedium: '10px' },
  Input: {
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.06)',
    colorFocus: 'rgba(255, 255, 255, 0.08)',
    textColor: '#edf7f2',
    placeholderColor: '#65776f',
    border: '1px solid rgba(111, 136, 124, 0.22)',
    borderHover: '1px solid rgba(20, 184, 166, 0.4)',
    borderFocus: '1px solid #14b8a6',
    caretColor: '#14b8a6',
    boxShadowFocus: '0 0 0 3px rgba(20, 184, 166, 0.16)',
  },
  Switch: { railColorActive: '#14b8a6' },
}

export const naiveLightThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...common,
    primaryColor: '#0f766e',
    primaryColorHover: '#0d9488',
    primaryColorPressed: '#115e59',
    primaryColorSuppl: '#0f766e',
    bodyColor: '#f4f7f4',
    baseColor: '#ffffff',
    textColorBase: '#1c2923',
    textColor1: '#1c2923',
    textColor2: '#3d5148',
    textColor3: '#60736a',
    borderColor: 'rgba(69, 93, 82, 0.22)',
  },
  Button: {
    borderRadiusMedium: '10px',
    textColor: '#1c2923',
    textColorHover: '#0f766e',
    textColorPressed: '#115e59',
    textColorDisabled: 'rgba(28, 41, 35, 0.36)',
    color: 'rgba(255, 255, 255, 0.78)',
    colorHover: '#ffffff',
    colorPressed: '#eef5f1',
    colorDisabled: 'rgba(243, 248, 245, 0.74)',
    border: '1px solid rgba(69, 93, 82, 0.24)',
    borderHover: '1px solid rgba(15, 118, 110, 0.58)',
    borderPressed: '1px solid rgba(17, 94, 89, 0.62)',
    borderDisabled: '1px solid rgba(69, 93, 82, 0.12)',
  },
  Input: {
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.84)',
    colorFocus: '#ffffff',
    colorDisabled: 'rgba(243, 248, 245, 0.72)',
    textColor: '#1c2923',
    caretColor: '#0f766e',
    placeholderColor: '#8ca097',
    border: '1px solid rgba(69, 93, 82, 0.22)',
    borderHover: '1px solid rgba(15, 118, 110, 0.46)',
    borderFocus: '1px solid #0f766e',
    boxShadowFocus: '0 0 0 3px rgba(15, 118, 110, 0.16)',
  },
  Switch: { railColorActive: '#0f766e' },
}
