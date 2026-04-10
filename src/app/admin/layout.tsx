"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebarAdmin from "@/layout/AppSidebarAdmin";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import RoleGate from "@/components/auth/RoleGate";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  let mainContentMargin = "lg:ml-[90px]";
  if (isMobileOpen) {
    mainContentMargin = "ml-0";
  } else if (isExpanded || isHovered) {
    mainContentMargin = "lg:ml-[290px]";
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebarAdmin />
      <Backdrop />
      {/* Main Content Congreso */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <RoleGate allowedRoles={["ADMIN", "ADMINISTRADOR", "ROLE_ADMIN"]}>
            {children}
          </RoleGate>
        </div>
      </div>
    </div>
  );
}
