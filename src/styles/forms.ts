// Consistent form styling across the application
export const FORM_STYLES = {
  // Base input styling for all forms
  input: "w-full px-4 py-3 text-base bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200",
  
  // Large input for primary fields (like club name)
  inputLarge: "w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200",
  
  // Centered input for key fields
  inputCentered: "w-full px-4 py-3 text-base text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200",
  
  // Large centered input
  inputLargeCentered: "w-full px-6 py-4 text-lg text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200",
  
  // Textarea styling
  textarea: "w-full px-4 py-3 text-base bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200 resize-none",
  
  // Select styling
  select: "w-full px-4 py-3 text-base bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200",
  
  // Button styling
  button: {
    primary: "px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 rounded-lg font-medium",
    secondary: "px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg font-medium",
    success: "px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 rounded-lg font-medium"
  },
  
  // Form containers
  container: {
    centered: "max-w-lg mx-auto space-y-6",
    wide: "max-w-2xl mx-auto space-y-6",
    narrow: "max-w-md mx-auto space-y-6"
  },
  
  // Label styling
  label: "block text-sm font-medium text-white mb-2",
  labelCentered: "block text-sm font-medium text-gray-300 text-center",
  
  // Helper text
  helper: "text-sm text-gray-300",
  helperCentered: "text-sm text-gray-300 text-center",
  error: "text-sm text-red-300",
  errorCentered: "text-sm text-red-300 text-center"
} as const