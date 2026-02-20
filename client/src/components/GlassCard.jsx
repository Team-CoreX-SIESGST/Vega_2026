// src/components/GlassCard.jsx
export const GlassCard = ({ children, className }) => (
    <div className={`bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl ${className}`}>
      {children}
    </div>
  );