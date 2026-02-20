// src/components/GlowButton.jsx
export const GlowButton = ({ children, className, ...props }) => (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );