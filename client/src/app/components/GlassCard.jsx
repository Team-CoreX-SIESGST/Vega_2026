const GlassCard = ({ children, className = "", hover = true, glow = false, style }) => {
    // Combine classNames without cn utility
    const getClassNames = () => {
      const classes = [
        "glass rounded-xl p-6 transition-all duration-500",
        hover && "hover:scale-[1.02] hover:border-primary/50",
        glow && "box-glow",
        className
      ];
      
      return classes.filter(Boolean).join(" ");
    };
  
    return (
      <div
        className={getClassNames()}
        style={style}
      >
        {children}
      </div>
    );
  };
  
  export default GlassCard;