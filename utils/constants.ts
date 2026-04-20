/** KasaNet renk paleti */
export const colors = {
  // Ana renkler
  primary: '#1B2838',
  primaryLight: '#2A3F5F',
  secondary: '#FF6B35',

  // Durum renkleri
  income: '#00C853',
  incomeLight: '#E8F5E9',
  expense: '#FF1744',
  expenseLight: '#FFEBEE',
  profit: '#2196F3',
  loss: '#FF5722',

  // Nötr
  background: '#F5F7FA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  disabled: '#D1D5DB',

  // Grafik renkleri
  chartGreen: '#4CAF50',
  chartRed: '#EF5350',
  chartBlue: '#42A5F5',
  chartOrange: '#FFA726',
};

/** Tipografi ayarları */
export const typography = {
  fontFamily: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_500Medium',
    semiBold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    extraBold: 'Nunito_800ExtraBold',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 40,
  },
};

/** Stil sabitleri */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
};

/** Varsayılan kategoriler */
export const defaultCategories = {
  incomeCategories: ['Satış', 'Hizmet', 'Diğer'],
  expenseCategories: ['Kira', 'Fatura', 'Maaş', 'Mal Alımı', 'Diğer'],
};

/** Para birimi */
export const defaultCurrency = '₺';
