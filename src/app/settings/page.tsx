'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [settings, setSettings] = useState({
        storeEmail: '',
        facebook: '',
        instagram: '',
        twitter: '',
        discord: '',
        whatsapp: '',
        youtube: '',
        tiktok: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data) {
                    setSettings(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Failed to fetch settings');
                toast.error('حدث خطأ أثناء تحميل الإعدادات');
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { currentPassword, newPassword, confirmPassword, ...toSave } = settings;
            await api.patch('/settings', toSave);
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
            toast.error('يرجى ملء كافة حقول كلمة المرور');
            return;
        }

        if (settings.newPassword !== settings.confirmPassword) {
            toast.error('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: settings.currentPassword,
                newPassword: settings.newPassword
            });
            toast.success('تم تغيير كلمة المرور بنجاح');
            setSettings(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-8 text-right" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-black text-white italic uppercase font-display tracking-tight">إعدادات المنصة</h1>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary-dark text-black font-black px-8 h-12 rounded-xl transition-all shadow-lg shadow-primary/20">
                        {isSaving ? <Loader2 className="animate-spin" /> : 'حفظ الإعدادات'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Identity Section */}
                    <div className="bg-surface-dark border border-glass-border p-8 rounded-2xl space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <span className="material-symbols-outlined">brand_awareness</span>
                            <h2 className="text-xl font-bold italic">البريد الإلكتروني</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-400 text-sm">البريد الإلكتروني الرسمي</Label>
                                <Input value={settings.storeEmail} onChange={e => handleChange('storeEmail', e.target.value)} className="bg-black border-glass-border rounded-xl text-white h-12 text-left" dir="ltr" />
                            </div>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="bg-surface-dark border border-glass-border p-8 rounded-2xl space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <span className="material-symbols-outlined">share</span>
                            <h2 className="text-xl font-bold italic">روابط التواصل</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 text-left" dir="ltr">
                            <Input value={settings.facebook} onChange={e => handleChange('facebook', e.target.value)} placeholder="Facebook URL" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="Instagram URL" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.twitter} onChange={e => handleChange('twitter', e.target.value)} placeholder="Twitter URL" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.discord} onChange={e => handleChange('discord', e.target.value)} placeholder="Discord Invite URL" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="WhatsApp (e.g. 964...)" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.youtube} onChange={e => handleChange('youtube', e.target.value)} placeholder="YouTube URL" className="bg-black border-glass-border rounded-xl text-white" />
                            <Input value={settings.tiktok} onChange={e => handleChange('tiktok', e.target.value)} placeholder="TikTok URL" className="bg-black border-glass-border rounded-xl text-white" />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-surface-dark border border-glass-border p-8 rounded-2xl space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <span className="material-symbols-outlined">lock_reset</span>
                            <h2 className="text-xl font-bold italic">تغيير كلمة المرور</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-400 text-sm">كلمة المرور الحالية</Label>
                                <Input type="password" value={settings.currentPassword} onChange={e => handleChange('currentPassword', e.target.value)} className="bg-black border-glass-border rounded-xl text-white h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400 text-sm">كلمة المرور الجديدة</Label>
                                <Input type="password" value={settings.newPassword} onChange={e => handleChange('newPassword', e.target.value)} className="bg-black border-glass-border rounded-xl text-white h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400 text-sm">تأكيد كلمة المرور الجديدة</Label>
                                <Input type="password" value={settings.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} className="bg-black border-glass-border rounded-xl text-white h-12" />
                            </div>
                        </div>
                        <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="w-full bg-white hover:bg-gray-200 text-black font-black h-12 rounded-xl transition-all">
                            {isChangingPassword ? <Loader2 className="animate-spin" /> : 'تحديث كلمة المرور'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
