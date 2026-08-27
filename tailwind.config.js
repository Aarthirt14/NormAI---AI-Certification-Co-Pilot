/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#F7FAFC',
        'surface': '#FFFFFF',
        'surface-subtle': '#F8FAFC',
        'brand-blue': '#2563EB',
        'brand-blue-hover': '#1D4ED8',
        'brand-blue-medium': '#3B82F6',
        'brand-blue-light': '#EAF4FF',
        'brand-blue-subtle': '#F2F8FF',
        'text-dark': '#172033',
        'text-body': '#475569',
        'text-muted': '#8492A6',
        'border-ui': '#E5EDF5',
        'border-ui-light': '#F1F5F9',
        'status-success': '#16A36A',
        'status-success-light': '#ECFDF5',
        'status-warning': '#F59E0B',
        'status-warning-light': '#FFFBEB',
        'status-error': '#DC5A5A',
        'status-error-light': '#FEF2F2',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 16px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        'drawer': '-4px 0 24px rgba(15, 23, 42, 0.08)',
        'dropdown': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        'control': '8px',
        'card': '12px',
        'container': '16px',
      }
    },
  },
  plugins: [],
}
