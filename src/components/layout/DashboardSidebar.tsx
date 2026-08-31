import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import aimployLogo from "@/assets/aimploy-logo.png";

export interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse Jobs", icon: Briefcase, path: "/dashboard/jobs" },
  { label: "My Applications", icon: FileText, path: "/dashboard/applications" },
  { label: "Programs", icon: GraduationCap, path: "/dashboard/programs" },
  { label: "Challenges", icon: Trophy, path: "/dashboard/challenges" },
  { label: "Verification", icon: ShieldCheck, path: "/dashboard/bgv-verification" },
  { label: "Profile", icon: User, path: "/dashboard/profile" },
];

interface SidebarTooltipProps {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({ label, collapsed, children }) => {
  if (!collapsed) return <>{children}</>;
  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" className="ml-2 font-semibold text-xs py-1 px-2.5 bg-card border border-border shadow-md text-foreground">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export const DashboardSidebar = () => {
  const { collapsed, toggleCollapsed, setCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar flex-col border-r border-sidebar-border z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <img src={aimployLogo} alt="Aimploy" className="h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center items-center"
            >
              <img src="/Aimploy Logo_4.png" alt="Aimploy" className="h-10 w-10 object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Border Toggle Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 w-6.5 h-6.5 bg-background dark:bg-card border border-border rounded-full flex items-center justify-center text-foreground shadow-md hover:bg-accent hover:text-primary transition-all cursor-pointer z-[100]"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto sidebar-scroll transition-all duration-300", collapsed ? "py-2 px-1.5" : "py-6 px-3")}>
        <ul className={cn("space-y-1", collapsed ? "space-y-1" : "space-y-1.5")}>
          {navItems.map((item) => {
            const isActive = item.path === "/dashboard" 
              ? location.pathname === "/dashboard" 
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <li key={item.path} className="flex justify-center">
                <SidebarTooltip label={item.label} collapsed={collapsed}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (item.path === "/dashboard/bgv-verification") {
                        setCollapsed(true);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                      collapsed ? "w-10 h-10 justify-center p-0" : "px-3 py-2.5 rounded-lg w-full",
                      isActive
                        ? collapsed 
                          ? "bg-[#9000FF] text-white shadow-md shadow-purple-500/25 scale-105" 
                          : "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-[#9000FF]",
                          collapsed ? "-left-1.5 h-5" : "h-6"
                        )}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={20}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? (collapsed ? "text-white" : "text-sidebar-primary") : "text-sidebar-foreground group-hover:text-[#9000FF]"
                      )}
                    />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarTooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "px-3")}>
          <ThemeToggle />
          {!collapsed && (
            <span className="text-sm text-sidebar-foreground ml-2">Theme</span>
          )}
        </div>
        <SidebarTooltip label="Logout" collapsed={collapsed}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut size={20} className="shrink-0 text-sidebar-foreground" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </SidebarTooltip>
      </div>
    </motion.aside>
  );
};
