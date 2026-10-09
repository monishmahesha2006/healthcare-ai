import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AIAssistantDrawer } from '../../features/ai-assistant/AIAssistantDrawer';
import { Bot } from 'lucide-react';

interface LayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onSelectTab, children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '10px',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          padding: '8px 16px',
          zIndex: 1000,
          borderRadius: '4px',
          transition: 'top 0.2s',
        }}
        onFocus={(e) => ((e.target as HTMLElement).style.top = '10px')}
        onBlur={(e) => ((e.target as HTMLElement).style.top = '-40px')}
      >
        Skip to main content
      </a>

      <Navbar onOpenAssistant={() => setIsAssistantOpen(true)} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar currentTab={currentTab} onSelectTab={onSelectTab} />
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-app)',
            padding: '2rem 1.5rem',
            overflowY: 'auto',
          }}
        >
          <div className="container">{children}</div>
        </main>
      </div>

      {/* Floating AI Assistant trigger pill */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        aria-label="Open AI Health Assistant chat"
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.925rem',
          fontWeight: 600,
          zIndex: 90,
          transition: 'transform 0.15s ease',
        }}
      >
        <Bot size={20} />
        <span>Ask Health AI</span>
      </button>

      {/* Slide-out / Modal AI Assistant Drawer */}
      <AIAssistantDrawer isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};
