'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '@/schemas';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export default function LoginPage() {
    const { login, isLoading } = useAuth();

    const form = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginInput) => {
        login(data);
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-body text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>

            <div className="relative z-10 w-full max-w-[440px] p-4">
                <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-glass">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-surface border border-primary/40 flex items-center justify-center mb-4 shadow-neon">
                            <span className="material-symbols-outlined text-primary text-4xl">movie</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white font-display">علي فاضل</h1>
                        <p className="text-gray-400 mt-2 text-sm font-medium">بوابة إدارة النظام</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="block text-sm font-medium text-gray-300">البريد الإلكتروني</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </div>
                                            <FormControl>
                                                <input
                                                    className="block w-full rounded-lg bg-surface border border-glass-border text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary pr-11 py-3.5 transition-all"
                                                    placeholder="admin@ali-fadhil.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex justify-between">
                                            <FormLabel className="block text-sm font-medium text-gray-300">كلمة المرور</FormLabel>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                            </div>
                                            <FormControl>
                                                <input
                                                    type="password"
                                                    className="block w-full rounded-lg bg-surface border border-glass-border text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary pr-11 py-3.5 transition-all"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg text-sm font-bold text-black bg-primary hover:bg-primary-hover transition-all shadow-neon hover:shadow-lg transform hover:-translate-y-0.5"
                                disabled={isLoading}
                            >
                                <span>{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
                                {!isLoading && <span className="material-symbols-outlined mr-2 rtl:rotate-180 text-lg">arrow_forward</span>}
                            </button>
                        </form>
                    </Form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">نسيت كلمة المرور؟</a>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-600 mt-8 font-display">© 2024 Ali Fadhil. v2.1.0</p>
            </div>
        </div>
    );
}
