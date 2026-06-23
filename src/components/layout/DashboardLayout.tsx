import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { DashboardSidebar, navItems } from "./DashboardSidebar";
import { motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";
import { cn } from "@/lib/utils";

const DashboardContent = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-background flex w-full flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full text-sidebar-foreground">
              {/* Logo section */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
                <div className="flex items-center gap-3">
                  <img src={aimployLogo} alt="Aimploy" className="h-8" />
                </div>
              </div>
              
              {/* Mobile Navigation Links */}
              <nav className="flex-1 py-6 px-3 overflow-y-auto sidebar-scroll">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = item.path === "/dashboard" 
                      ? location.pathname === "/dashboard" 
                      : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                      <li key={item.path}>
                        <SheetClose asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                              isActive
                                ? "bg-sidebar-primary/10 text-sidebar-primary"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon
                              size={20}
                              className={cn(
                                "shrink-0 transition-colors",
                                isActive ? "text-sidebar-primary" : "text-sidebar-foreground"
                              )}
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile Logout / Theme Actions */}
              <div className="p-3 border-t border-sidebar-border space-y-1 shrink-0">
                <div className="flex items-center px-3 py-2">
                  <ThemeToggle />
                  <span className="text-sm ml-2">Theme</span>
                </div>
                <SheetClose asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full text-left"
                  >
                    <LogOut size={20} className="shrink-0" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/dashboard" className="flex items-center">
            <img src={aimployLogo} alt="Aimploy" className="h-7" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Panel */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen pt-16 lg:pt-0",
          collapsed ? "lg:pl-20" : "lg:pl-[280px]"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};
