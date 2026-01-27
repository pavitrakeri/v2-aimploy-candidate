import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { motion } from "framer-motion";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 ml-20 md:ml-[280px] transition-all duration-300"
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};
