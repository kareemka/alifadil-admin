'use client';

import { useTheme } from 'next-themes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { setTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className="h-20 sticky top-0 z-10 glass-panel border-b border-glass-border flex items-center justify-between px-6 lg:px-8">
            {/* Mobile Menu Toggle and Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl hover:bg-white/5 text-gray-400 h-10 w-10 shrink-0"
                    onClick={onMenuClick}
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </Button>

                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-xl border-0 bg-surface-dark/50 py-2.5 pr-10 pl-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-surface-dark sm:text-sm sm:leading-6 transition-all"
                        placeholder="بحث في النظام..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 mr-4">
                <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                </button>

                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-bold text-white leading-none">{user?.name || 'أحمد محمد'}</p>
                        <p className="text-xs text-gray-400 leading-none mt-1">مدير النظام</p>
                    </div>
                    <div className="relative w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-gray-400">
                        <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
