// ============================================
// Sidebar.jsx
// ============================================
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  RotateCcw,
  Package,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'traffic', label: 'Traffic & Engagement', icon: TrendingUp },
  { id: 'conversion', label: 'Conversion Analysis', icon: ShoppingCart },
  { id: 'revenue', label: 'Revenue & Orders', icon: DollarSign },
  { id: 'refunds', label: 'Refund Analysis', icon: RotateCcw },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'ask_ai', label: 'Ask AI', icon: Sparkles },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

const Sidebar = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary-sm">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">BearCart</h1>
            <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Analytics
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/15 text-primary border border-primary/20 glow-primary-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;