import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const UnicornBackground = () => {
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const loadUnicornStudio = () => {
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false, init: () => {}, destroy: () => {} };
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js';
        script.onload = () => {
          if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
            window.UnicornStudio.init();
            window.UnicornStudio.isInitialized = true;
          }
        };
        document.head.appendChild(script);
      } else if (!window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };

    loadUnicornStudio();
    scriptLoaded.current = true;

    return () => {
      if (window.UnicornStudio?.destroy) {
        window.UnicornStudio.destroy();
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        data-us-project="F2sVTMkw2IIFU538t9Op"
        sx={{
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 1))',
        }}
      />
    </Box>
  );
};

export default UnicornBackground;