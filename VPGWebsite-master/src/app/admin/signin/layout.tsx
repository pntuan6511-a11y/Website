"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <ThemeProvider>
                <div className="relative flex lg:flex-row w-full min-h-screen justify-center items-center flex-col dark:bg-gray-900 sm:p-0">
                    {children}
                    <div className="lg:w-1/2 w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 lg:grid items-center hidden min-h-screen">
                        <div className="relative items-center justify-center flex z-1">
                            <div className="flex flex-col items-center max-w-xs text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    VFG An Giang
                                </h2>
                                <p className="text-center text-gray-200 dark:text-white/60">
                                    Hệ thống quản trị website VPG Auto - Nền tảng quản lý xe hơi chuyên nghiệp
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}
