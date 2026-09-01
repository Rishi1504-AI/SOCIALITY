/**
 * Sociality AI - Central Tailwind CSS Configuration
 * Provides unified design tokens, typography, and palette across all pages.
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        "surface-container-low": "#f7f3f0",
        "surface-container-high": "#ece7e4",
        "background": "#fdf8f5",
        "surface": "#fdf8f5",
        "on-error-container": "#93000a",
        "inverse-on-surface": "#f4f0ed",
        "surface-bright": "#fdf8f5",
        "on-background": "#1c1b1a",
        "inverse-primary": "#cec6b0",
        "surface-variant": "#e6e2df",
        "on-surface-variant": "#4a473e",
        "on-secondary-fixed": "#00201f",
        "secondary-fixed-dim": "#81d5d3",
        "on-secondary": "#ffffff",
        "error-container": "#ffdad6",
        "on-primary-container": "#76705d",
        "error": "#ba1a1a",
        "outline": "#7b776d",
        "tertiary": "#984726",
        "surface-container": "#f2edea",
        "tertiary-container": "#fff4f1",
        "surface-container-highest": "#e6e2df",
        "on-tertiary-fixed": "#380d00",
        "tertiary-fixed": "#ffdbce",
        "outline-variant": "#ccc6ba",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#1f1b0d",
        "on-primary": "#ffffff",
        "on-surface": "#1c1b1a",
        "on-tertiary-container": "#ae5836",
        "secondary": "#006a69",
        "primary-container": "#fff6de",
        "surface-dim": "#ddd9d6",
        "on-primary-fixed-variant": "#4b4735",
        "on-tertiary": "#ffffff",
        "on-secondary-container": "#006e6d",
        "primary": "#645e4c",
        "inverse-surface": "#31302e",
        "on-tertiary-fixed-variant": "#793010",
        "tertiary-fixed-dim": "#ffb59a",
        "secondary-container": "#9aeeec",
        "on-error": "#ffffff",
        "primary-fixed-dim": "#cec6b0",
        "secondary-fixed": "#9df1ef",
        "primary-fixed": "#ebe2cb",
        "surface-tint": "#645e4c",
        "on-secondary-fixed-variant": "#00504f"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "section-gap": "120px",
        "card-padding": "32px",
        "margin-mobile": "20px",
        "gutter": "24px",
        "container-max": "1280px"
      },
      fontFamily: {
        "label-md": ["Mulish", "sans-serif"],
        "body-md": ["Mulish", "sans-serif"],
        "body-lg": ["Mulish", "sans-serif"],
        "headline-lg-mobile": ["Arima Madurai", "serif"],
        "headline-lg": ["Arima Madurai", "serif"],
        "headline-sm": ["Arima Madurai", "serif"],
        "body-lg-mobile": ["Mulish", "sans-serif"],
        "display-lg": ["Arima Madurai", "serif"],
        "headline-md": ["Arima Madurai", "serif"]
      },
      fontSize: {
        "label-md": ["14px", { "lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "headline-sm": ["24px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "body-lg-mobile": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "display-lg": ["56px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }]
      }
    }
  }
};
