'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginInput } from '@/schemas';
import { toast } from 'sonner';

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginInput) => authService.login(credentials),
        onSuccess: () => {
            toast.success('Logged in successfully');
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to login');
        },
    });

    const logout = () => {
        authService.logout();
        queryClient.clear();
        router.push('/login');
    };

    return {
        login: loginMutation.mutate,
        isLoading: loginMutation.isPending,
        logout,
        user: { name: 'المدير', email: 'admin@ali-fadhil.com' },
    };
}
