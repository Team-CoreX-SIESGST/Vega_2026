const LoadingState = () => {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  };
  
  export default LoadingState;
  