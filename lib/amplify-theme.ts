import { createTheme } from "@aws-amplify/ui-react";

/**
 * amplify-theme.ts — Comprehensive Amplify UI theme backed by CSS custom properties.
 *
 * ONE source of truth: app/globals.css
 *
 * Strategy: override Amplify's semantic color tokens (background, font, border, brand)
 * with var(--*) references. Because all Amplify UI component tokens reference these
 * semantic tokens internally, every component automatically inherits the correct colors
 * without per-component color overrides.
 *
 * Per-component blocks below handle structural tokens (border-radius, padding,
 * box-shadow, etc.) that don't flow from the semantic color layer.
 *
 * To change any color → update app/globals.css only.
 * To add a new component's structural tokens → add a block under `tokens.components`.
 *
 * Full token reference: https://ui.docs.amplify.aws/react/theming/tokens
 */
export const appTheme = createTheme({
  name: "app-theme",

  tokens: {
    // ── Semantic color tokens ─────────────────────────────────────────────
    // All Amplify UI components reference these internally.
    // Overriding here propagates to every component automatically.
    colors: {
      // ── Brand (accent) ─────────────────────────────────────────────────
      brand: {
        primary: {
          10:  { value: "var(--accent-10)" },
          20:  { value: "var(--accent-20)" },
          40:  { value: "var(--accent-40)" },
          60:  { value: "var(--accent-60)" },
          80:  { value: "var(--accent-80)" },   // main accent
          90:  { value: "var(--accent-90)" },   // hover
          100: { value: "var(--accent-100)" },  // active / pressed
        },
      },

      // ── Background ─────────────────────────────────────────────────────
      background: {
        primary:   { value: "var(--bg)" },
        secondary: { value: "var(--surface)" },
        tertiary:  { value: "var(--surface)" },
      },

      // ── Font ───────────────────────────────────────────────────────────
      font: {
        primary:     { value: "var(--fg)" },
        secondary:   { value: "var(--text-muted)" },
        tertiary:    { value: "var(--text-muted)" },
        disabled:    { value: "var(--text-muted)" },
        interactive: { value: "var(--accent)" },
        hover:       { value: "var(--accent-90)" },
        focus:       { value: "var(--accent-100)" },
        active:      { value: "var(--accent-100)" },
      },

      // ── Border ─────────────────────────────────────────────────────────
      border: {
        primary:   { value: "var(--border)" },
        secondary: { value: "var(--border)" },
        tertiary:  { value: "var(--border)" },
        focus:     { value: "var(--accent)" },
        pressed:   { value: "var(--accent-100)" },
      },
    },

    // ── Component structural tokens ───────────────────────────────────────
    // Only properties confirmed by the TypeScript type definitions.
    components: {

      // ── Authenticator ──────────────────────────────────────────────────
      authenticator: {
        router: {
          borderWidth:     { value: "1px" },
          borderColor:     { value: "var(--border)" },
          backgroundColor: { value: "var(--bg)" },
          boxShadow:       { value: "0 1px 3px 0 rgb(0 0 0 / 0.1)" },
        },
      },

      // ── Button ─────────────────────────────────────────────────────────
      button: {
        primary: {
          backgroundColor: { value: "var(--accent)" },
          borderColor:     { value: "var(--accent)" },
          color:           { value: "#ffffff" },
          _hover:  { backgroundColor: { value: "var(--accent-90)" }, borderColor: { value: "var(--accent-90)" }, color: { value: "#ffffff" } },
          _focus:  { backgroundColor: { value: "var(--accent-90)" }, borderColor: { value: "var(--accent-90)" }, color: { value: "#ffffff" } },
          _active: { backgroundColor: { value: "var(--accent-100)" }, borderColor: { value: "var(--accent-100)" }, color: { value: "#ffffff" } },
        },
        link: {
          color:       { value: "var(--accent)" },
          borderColor: { value: "transparent" },
          _hover:  { color: { value: "var(--accent-90)" }, borderColor: { value: "transparent" }, backgroundColor: { value: "transparent" } },
          _active: { color: { value: "var(--accent-100)" }, borderColor: { value: "transparent" }, backgroundColor: { value: "transparent" } },
        },
      },

      // ── Card ───────────────────────────────────────────────────────────
      card: {
        backgroundColor: { value: "var(--bg)" },
        borderColor:     { value: "var(--border)" },
        boxShadow:       { value: "0 1px 3px 0 rgb(0 0 0 / 0.07)" },
      },

      // ── Checkbox ───────────────────────────────────────────────────────
      // CheckboxTokens: button.before holds border styles; icon._checked holds fill
      checkbox: {
        button: {
          _disabled: { borderColor: { value: "var(--border)" } },
        },
        icon: {
          _checked: {
            _disabled: { backgroundColor: { value: "var(--text-muted)" } },
          },
        },
      },

      // ── Divider ────────────────────────────────────────────────────────
      divider: {
        borderColor: { value: "var(--border)" },
        borderWidth: { value: "1px" },
      },

      // ── Field label (shared across all form fields) ────────────────────
      field: {
        label: {
          color: { value: "var(--fg)" },
        },
      },

      // ── FieldControl (shared input/textarea/select base) ───────────────
      fieldcontrol: {
        borderColor: { value: "var(--border)" },
        color:       { value: "var(--fg)" },
        _focus: {
          borderColor: { value: "var(--accent)" },
          boxShadow:   { value: "var(--focus-ring)" },
        },
      },

      // ── Heading ────────────────────────────────────────────────────────
      heading: {
        color: { value: "var(--fg)" },
      },

      // ── Link ───────────────────────────────────────────────────────────
      // LinkTokens: color + state keys (active | focus | hover | visited)
      link: {
        color:   { value: "var(--accent)" },
        hover:   { color: { value: "var(--accent-90)" } },
        focus:   { color: { value: "var(--accent-100)" } },
        active:  { color: { value: "var(--accent-100)" } },
        visited: { color: { value: "var(--accent-60)" } },
      },

      // ── Loader ─────────────────────────────────────────────────────────
      loader: {
        strokeFilled: { value: "var(--accent)" },
        strokeEmpty:  { value: "var(--border)" },
      },

      // ── Menu ───────────────────────────────────────────────────────────
      menu: {
        backgroundColor: { value: "var(--bg)" },
        borderColor:     { value: "var(--border)" },
        boxShadow:       { value: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
      },

      // ── Pagination ─────────────────────────────────────────────────────
      pagination: {
        current: {
          backgroundColor: { value: "var(--accent)" },
          color:           { value: "#ffffff" },
        },
        button: {
          color: { value: "var(--fg)" },
          hover: { backgroundColor: { value: "var(--surface)" } },
        },
      },

      // ── Placeholder (skeleton loader) ──────────────────────────────────
      placeholder: {
        startColor: { value: "var(--surface)" },
        endColor:   { value: "var(--border)" },
      },

      // ── Radio ──────────────────────────────────────────────────────────
      // RadioTokens: button._checked only allows `color` (the dot fill)
      radio: {
        button: {
          borderColor: { value: "var(--border)" },
          _checked: {
            color: { value: "var(--accent)" },
          },
          _focus: {
            borderColor: { value: "var(--accent)" },
            boxShadow:   { value: "var(--focus-ring)" },
          },
        },
      },

      // ── Rating ─────────────────────────────────────────────────────────
      rating: {
        filled: { color: { value: "var(--accent)" } },
        empty:  { color: { value: "var(--border)" } },
      },

      // ── SearchField ────────────────────────────────────────────────────
      searchfield: {
        button: {
          color:           { value: "var(--fg)" },
          backgroundColor: { value: "var(--surface)" },
          _hover: {
            backgroundColor: { value: "var(--border)" },
          },
        },
      },

      // ── SliderField ────────────────────────────────────────────────────
      sliderfield: {
        thumb: {
          backgroundColor: { value: "var(--accent)" },
          borderColor:     { value: "var(--accent)" },
        },
        track: {
          backgroundColor: { value: "var(--border)" },
        },
        range: {
          backgroundColor: { value: "var(--accent)" },
        },
      },

      // ── StepperField ───────────────────────────────────────────────────
      stepperfield: {
        button: {
          color:           { value: "var(--fg)" },
          backgroundColor: { value: "var(--surface)" },
          _hover: {
            backgroundColor: { value: "var(--border)" },
          },
        },
      },

      // ── SwitchField ────────────────────────────────────────────────────
      switchfield: {
        thumb: {
          backgroundColor: { value: "#ffffff" },
        },
        track: {
          backgroundColor: { value: "var(--border)" },
          checked: {
            backgroundColor: { value: "var(--accent)" },
          },
        },
      },

      // ── Table ──────────────────────────────────────────────────────────
      // TableTokens: head/body/foot/row only allow display + verticalAlign.
      // Cell-level tokens live under `header` and `data`.
      table: {
        header: {
          color:       { value: "var(--fg)" },
          borderColor: { value: "var(--border)" },
        },
        data: {
          color:       { value: "var(--fg)" },
          borderColor: { value: "var(--border)" },
        },
        row: {
          hover:   { backgroundColor: { value: "var(--surface)" } },
          striped: { backgroundColor: { value: "var(--surface)" } },
        },
      },

      // ── Tabs ───────────────────────────────────────────────────────────
      tabs: {
        borderColor: { value: "var(--border)" },
        item: {
          color:           { value: "var(--text-muted)" },
          borderColor:     { value: "transparent" },
          backgroundColor: { value: "transparent" },
          _hover: {
            color:       { value: "var(--fg)" },
            borderColor: { value: "var(--border)" },
          },
          _active: {
            color:           { value: "var(--accent)" },
            borderColor:     { value: "var(--accent)" },
            backgroundColor: { value: "transparent" },
          },
          _disabled: {
            color: { value: "var(--text-muted)" },
          },
        },
      },

      // ── Text ───────────────────────────────────────────────────────────
      text: {
        color: { value: "var(--fg)" },
      },

      // ── ToggleButton ───────────────────────────────────────────────────
      // ToggleButtonTokens: top-level only allows borderColor + color
      togglebutton: {
        borderColor: { value: "var(--border)" },
        color:       { value: "var(--fg)" },
        _hover:   { backgroundColor: { value: "var(--surface)" } },
        _pressed: {
          backgroundColor: { value: "var(--accent)" },
          borderColor:     { value: "var(--accent)" },
          color:           { value: "#ffffff" },
        },
      },
    },
  },
});
