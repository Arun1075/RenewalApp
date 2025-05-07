import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  LogOut, 
  Menu, 
  Settings, 
  User, 
  X,
  Bell,
  Sun,
  Moon,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply page-specific theme based on current path
  useEffect(() => {
    // Reset all theme classes
    document.body.classList.remove(
      'theme-admin-dashboard', 
      'theme-admin-renewals',
      'theme-user-dashboard',
      'theme-login'
    );
    
    // Apply theme based on current path
    if (location.pathname === '/admin/dashboard') {
      document.body.classList.add('theme-admin-dashboard');
    } else if (location.pathname.includes('/admin/renewals')) {
      document.body.classList.add('theme-admin-renewals');
    } else if (location.pathname.includes('/user/dashboard')) {
      document.body.classList.add('theme-user-dashboard');
    } else if (location.pathname.includes('/login')) {
      document.body.classList.add('theme-login');
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin/dashboard') return 'Admin Dashboard';
    if (location.pathname.includes('/admin/renewals')) return 'Renewals Management';
    if (location.pathname.includes('/admin/users')) return 'Users Management';
    if (location.pathname.includes('/admin/notifications')) return 'Notifications';
    if (location.pathname.includes('/admin/reminders')) return 'Reminders';
    if (location.pathname.includes('/admin/settings')) return 'Settings';
    return 'Renewal Management System';
  };

  const SidebarItem = ({ icon, text, path, onClick }: { 
    icon: React.ReactNode; 
    text: string; 
    path?: string;
    onClick?: () => void;
  }) => {
    const active = path ? isActivePath(path) : false;
    
    const content = (
      <div
        className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
          active 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "hover:bg-primary/10 text-foreground hover:translate-x-1"
        }`}
      >
        <div className="w-6 h-6 mr-3 flex-shrink-0">{icon}</div>
        <span className="flex-grow">{text}</span>
        {active && <ChevronRight size={16} className="text-primary-foreground" />}
      </div>
    );

    if (onClick) {
      return (
        <li>
          <button onClick={onClick} className="w-full text-left">
            {content}
          </button>
        </li>
      );
    }

    return (
      <li>
        <Link to={path || '#'}>
          {content}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-card to-card/95 shadow-lg border-r border-border transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h2 className="text-lg font-medium text-primary">Renewals App</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-primary/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-4 py-6">
          {/* User profile summary */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center shadow-md">
                {currentUser?.name ? currentUser.name.charAt(0) : "U"}
              </div>
              <div className="ml-3">
                <div className="font-medium">{currentUser?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">{currentUser?.email || 'user@example.com'}</div>
              </div>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-1.5">
              <SidebarItem 
                icon={<BarChart3 size={20} />} 
                text="Dashboard" 
                path="/admin/dashboard"
              />
              <SidebarItem 
                icon={<Calendar size={20} />} 
                text="Renewals" 
                path="/admin/renewals"
              />
              <SidebarItem 
                icon={<User size={20} />} 
                text="Users" 
                path="/admin/users"
              />
              <SidebarItem 
                icon={<Bell size={20} />} 
                text="Notifications" 
                path="/admin/notifications"
              />
              <SidebarItem 
                icon={<Clock size={20} />} 
                text="Reminders" 
                path="/admin/reminders"
              />
              <SidebarItem 
                icon={<Settings size={20} />} 
                text="Settings" 
                path="/admin/settings"
              />
              
              <div className="pt-4 mt-4 border-t border-border">
                <SidebarItem 
                  icon={<LogOut size={20} />} 
                  text="Logout" 
                  onClick={handleLogout}
                />
              </div>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mr-4 p-2 rounded-lg hover:bg-primary/10 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-medium">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-primary/10 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full"></span>
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center shadow-md">
                {currentUser?.name ? currentUser.name.charAt(0) : "U"}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;