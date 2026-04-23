// Consistent form styling across the application
export const FORM_STYLES = {
  // Base input styling for all forms
  input: "w-full px-4 py-3 text-base bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200",

  // Large input for primary fields (like club name)
  inputLarge: "w-full px-6 py-4 text-lg bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200",

  // Centered input for key fields
  inputCentered: "w-full px-4 py-3 text-base text-center bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200",

  // Large centered input
  inputLargeCentered: "w-full px-6 py-4 text-lg text-center bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200",

  // Textarea styling
  textarea: "w-full px-4 py-3 text-base bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200 resize-none",

  // Select styling
  select: "w-full px-4 py-3 text-base bg-background border border-input text-foreground rounded-lg focus:border-ring focus:outline-none transition-all duration-200",

  // Button styling
  button: {
    primary: "px-6 py-3 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg font-medium",
    secondary: "px-6 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 hover:border-border transition-all duration-200 rounded-lg font-medium",
    success: "px-6 py-3 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg font-medium"
  },

  // Form containers
  container: {
    centered: "max-w-lg mx-auto space-y-6",
    wide: "max-w-2xl mx-auto space-y-6",
    narrow: "max-w-md mx-auto space-y-6"
  },

  // Label styling
  label: "block text-sm font-medium text-foreground mb-2",
  labelCentered: "block text-sm font-medium text-foreground dark:text-muted-foreground text-center",

  // Helper text
  helper: "text-sm text-muted-foreground",
  helperCentered: "text-sm text-muted-foreground text-center",
  error: "text-sm text-red-600 dark:text-red-300",
  errorCentered: "text-sm text-red-600 dark:text-red-300 text-center"
} as const
