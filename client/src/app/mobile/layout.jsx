'use client';
import InstallPrompt from '../../components/InstallPrompt';

export default function MobileLayout({ children }) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen">
          {children}
          <InstallPrompt /> 
        </div>
      </div>
    );
  }