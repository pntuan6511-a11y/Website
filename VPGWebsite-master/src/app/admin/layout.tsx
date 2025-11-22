"use client";

import AppHeader from "@/components/admin/layout/AppHeader";
import AppSidebar from "@/components/admin/layout/AppSidebar";
import Backdrop from "@/components/admin/layout/Backdrop";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignInPage = pathname?.includes("/signin");

  // For signin page, render without admin layout (sidebar/header)
  if (isSignInPage) {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  }

  // For other admin pages, render with full admin layout
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthGuard>
          <AdminLayoutInner>
            {children}
          </AdminLayoutInner>
        </AuthGuard>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're already on the signin page
    if (pathname?.includes("/signin")) {
      return;
    }

    // Redirect to signin if not authenticated
    if (status === "unauthenticated") {
      router.push("/admin/signin");
    }
  }, [status, router, pathname]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (status === "unauthenticated" && !pathname?.includes("/signin")) {
    return null;
  }

  return <>{children}</>;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</div>
      </div>
    </div>
  );
}
