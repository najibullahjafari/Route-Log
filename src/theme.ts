import { createTheme, responsiveFontSizes, type ThemeOptions } from '@mui/material/styles';

const deepShadow = '0px 12px 32px rgba(15, 23, 42, 0.08)';
const brandShadows = [
    'none',
    '0px 4px 16px rgba(15, 23, 42, 0.12)',
    '0px 8px 24px rgba(15, 23, 42, 0.1)',
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
    deepShadow,
] as ThemeOptions['shadows'];

let theme = createTheme({
    palette: {
        primary: {
            main: '#14213D',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#F97316',
            contrastText: '#1C1C1C',
        },
        background: {
            default: '#0F172A',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#0F172A',
            secondary: '#475569',
        },
        divider: '#E2E8F0',
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 14,
    },
    shadows: brandShadows,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #14213D 100%)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(120deg, #14213D 0%, #1F2937 40%, #0F172A 100%)',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingLeft: '24px',
                    paddingRight: '24px',
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 1,
            },
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(148, 163, 184, 0.16)',
                    backdropFilter: 'blur(4px)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: '22px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 14,
                        backgroundColor: '#FFFFFF',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                    padding: '8px',
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
