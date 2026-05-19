import { createTheme } from "@mui/material/styles";
import { defaultTheme } from "react-admin";

const GOV_RED = "#c41e3a";
const GOV_RED_DARK = "#8f1529";
const GOV_RED_LIGHT = "#d63a52";
const GOV_GOLD = "#d4af37";

export const milAdminTheme = createTheme(defaultTheme, {
  palette: {
    primary: { main: GOV_RED, dark: GOV_RED_DARK, light: GOV_RED_LIGHT, contrastText: "#fff" },
    secondary: { main: GOV_GOLD, contrastText: "#1a1a1a" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: { fontWeight: 700, letterSpacing: "0.04em" },
  },
  components: {
    MuiAppBar: {
      defaultProps: { color: "primary" },
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${GOV_RED_DARK} 0%, ${GOV_RED} 55%, #a81830 100%)`,
          color: "#fff",
          borderBottom: `2px solid ${GOV_GOLD}`,
          boxShadow: "0 2px 6px rgba(143, 21, 41, 0.35)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          ".MuiAppBar-root &": { color: "#fff" },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          ".MuiAppBar-root &": { color: "#fff" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: "#fffafa",
          "& fieldset": { borderColor: "#d4a0a8" },
          "&:hover fieldset": { borderColor: GOV_RED },
          "&.Mui-focused fieldset": { borderWidth: 2, borderColor: GOV_RED },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.8125rem" },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: `linear-gradient(180deg, ${GOV_RED_LIGHT} 0%, ${GOV_RED} 100%)`,
          boxShadow: "none",
          border: `1px solid ${GOV_RED_DARK}`,
          "&:hover": { boxShadow: "none", background: GOV_RED_DARK },
        },
        outlinedPrimary: { borderWidth: 2, fontWeight: 700 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: GOV_RED,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: `2px solid ${GOV_GOLD}`,
            whiteSpace: "nowrap",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#e8c4ca", fontSize: "0.875rem", py: 1.1 },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": { backgroundColor: "#fdf5f6" },
          "&:hover": { backgroundColor: "#fae8eb !important" },
          "&.RaDatagrid-clickableRow": { cursor: "pointer" },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `2px solid ${GOV_RED}`,
          backgroundColor: "#fdf5f6",
          fontWeight: 600,
        },
        toolbar: { minHeight: 52 },
        selectLabel: { fontWeight: 600, fontSize: "0.8125rem" },
        displayedRows: { fontWeight: 600, fontSize: "0.8125rem" },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: { borderRadius: 2, fontWeight: 700 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 2 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #e8c4ca", boxShadow: "0 1px 2px rgba(196,30,58,.08)" },
      },
    },
  },
});
