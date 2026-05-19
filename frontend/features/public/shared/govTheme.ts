export const GOV_RED = "#c41e3a";
export const GOV_RED_DARK = "#8f1529";
export const GOV_GOLD = "#d4af37";

export const tracePageSx = {
  minHeight: "100dvh",
  bgcolor: "transparent",
  p: 2,
} as const;

export const traceCardSx = {
  width: "100%",
  maxWidth: 860,
  mx: "auto",
  border: "1px solid #e8c4ca",
  borderRadius: "2px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(196, 30, 58, 0.1)",
} as const;

export const traceHeaderSx = {
  background: `linear-gradient(90deg, ${GOV_RED_DARK} 0%, ${GOV_RED} 55%, #a81830 100%)`,
  color: "#fff",
  px: 2,
  py: 1.25,
  borderBottom: `2px solid ${GOV_GOLD}`,
} as const;

export const traceSectionSx = {
  border: "1px solid #e8c4ca",
  borderRadius: "2px",
  overflow: "hidden",
  bgcolor: "#fff",
} as const;

export const traceSectionHeadSx = {
  background: `linear-gradient(90deg, ${GOV_RED_DARK} 0%, ${GOV_RED} 100%)`,
  color: "#fff",
  px: 1.5,
  py: 0.75,
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  borderLeft: `4px solid ${GOV_GOLD}`,
} as const;

export const traceLinkSx = {
  color: GOV_RED,
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "underline",
  textUnderlineOffset: 4,
  "&:hover": { color: GOV_RED_DARK },
} as const;
