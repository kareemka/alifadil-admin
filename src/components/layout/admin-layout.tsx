'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background-dark text-white font-body">
            {/* Sidebar Overlay for Mobile */}
            <div className={cn(
                "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300",
                isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )} onClick={() => setIsSidebarOpen(false)} />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
