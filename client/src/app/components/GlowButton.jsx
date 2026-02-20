
const GlowButton = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    onClick,
    href,
  }) => {
    const baseStyles = "font-display font-semibold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:shadow-neon animate-glow-pulse border border-primary/50",
      secondary: "bg-secondary/20 text-foreground border border-secondary hover:bg-secondary/40 hover:shadow-neon-accent",
      outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary/10 hover:shadow-neon",
    };
  
    const sizes = {
      sm: "px-4 py-2 text-xs rounded-md",
      md: "px-6 py-3 text-sm rounded-lg",
      lg: "px-8 py-4 text-base rounded-xl",
    };
  
    const Component = href ? "a" : "button";
    const props = href ? { href } : { onClick };
    
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();
  
    return (
      <Component
        {...props}
        className={combinedClassName}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Component>
    );
  };
  
  export default GlowButton;