import { createTheme, ThemeProvider } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    headingXl: React.CSSProperties;
    headingMd: React.CSSProperties;
    bodyLg: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    headingXl?: React.CSSProperties;
    headingMd?: React.CSSProperties;
    bodyLg?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    headingXl: true;
    headingMd: true;
    bodyLg: true;
  }
}

export const theme = createTheme({
  typography: {
    headingXl: {
      fontSize: "20px",
      fontWeight: 500,
      lineHeight: "28px",
    },
    headingMd: {
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "22px",
    },
    bodyLg: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Inter, sans-serif",
        },
      },
      defaultProps: {
        variantMapping: {
          // Map the new variant to render a <h1> by default
          headingXl: "h1",
          headingMd: "h2",
          bodyLg: "p",
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          width: "1rem",
          height: "1rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "unset",
          border: "1px solid #DFE1E4",
          borderRadius: "4px",
          background: "#fff",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          width: "100%",
          height: "38px",
          border: "1px solid #DFE1E4",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "22px",
          fontFamily: "Inter, sans-serif",
          "&:hover": {
            background: "#F8F9FB",
          },
        },
      },
    },
  },
});
