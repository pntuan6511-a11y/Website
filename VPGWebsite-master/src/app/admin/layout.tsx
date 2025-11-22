"use client";

import AppHeader from "@/components/admin/layout/AppHeader";
import AppSidebar from "@/components/admin/layout/AppSidebar";
import Backdrop from "@/components/admin/layout/Backdrop";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminLayoutInner>
          {children}
        </AdminLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
