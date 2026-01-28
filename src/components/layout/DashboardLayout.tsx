import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

const DashboardContent = () => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 280 }}
      >
        <div className="p-6 lg:p-8">
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
