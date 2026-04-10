"use client";

import React from "react";
import AppHeader from "@/layout/AppHeader";
import AppSidebarStudent from "@/layout/AppSidebarStudent";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

export default function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  let mainContentMargin = "lg:ml-[90px]";
  if (isMobileOpen) {
    mainContentMargin = "ml-0";
  } else if (isExpanded || isHovered) {
    mainContentMargin = "lg:ml-[290px]";
  }

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebarStudent />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}