'use client';

import { useState, useEffect } from 'react';
import { fetchApi, API_URL } from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Upload, Camera, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface Backstage {
    id: number;
    image: string;
    title?: string;
}

export default function BackstagePage() {
    const [backstageItems, setBackstageItems] = useState<Backstage[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const loadBackstage = async (currentPage: number) => {
        try {
            setLoading(true);
            const response = await fetchApi(`/backstage?page=${currentPage}&limit=12`);
            setBackstageItems(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalItems(response.total || 0);
        } catch (error) {
            toast.error('فشل في تحميل صور الكواليس');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackstage(page);
    }, [page]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (title.trim()) {
            formData.append('title', title.trim());
        }

        const toastId = toast.loading('جاري رفع الصورة...');
        try {
            await fetchApi('/backstage', {
                method: 'POST',
                body: formData
            });

            toast.success('تم رفع الصورة بنجاح', { id: toastId });
            setSelectedFile(null);
            setPreviewUrl(null);
            setTitle('');
            setIsUploadOpen(false);
            setPage(1); // Reset to first page to see the new upload
            loadBackstage(1);
        } catch (error) {
            toast.error('فشل في رفع الصورة', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const toastId = toast.loading('جاري الحذف...');
        try {
            await fetchApi(`/backstage/${deleteId}`, {
                method: 'DELETE'
            });
            toast.success('تم الحذف بنجاح', { id: toastId });
            setDeleteId(null);
            loadBackstage(page);
        } catch (error) {
            toast.error('فشل في حذف الصورة', { id: toastId });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">إدارة الكواليس</h1>
                        <p className="text-gray-400 text-sm mt-1">عرض صور ما وراء الكواليس في واجهة الموقع</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setTitle('');
                            setIsUploadOpen(true);
                        }} className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer">
                            <Plus className="w-5 h-5" />
                            <span>إضافة صورة جديدة</span>
                        </button>

                        <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl">
                            <span className="text-primary font-bold text-lg">{totalItems}</span>
                            <span className="text-gray-400 text-sm mr-2">إجمالي الصور</span>
                        </div>
                    </div>
                </div>

                {/* Backstage Grid Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 px-1">
                        <Camera className="w-4 h-4" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">معرض الكواليس الحالي</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {backstageItems.map((item) => (
                            <div key={item.id} className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/5 transition-all hover:-translate-y-1 shadow-lg">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={`${API_URL}/uploads/${item.image}`}
                                        alt="Backstage Photo"
                                        fill
                                        className="object-cover transition-all duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                         <button
                                            onClick={() => setDeleteId(item.id)}
                                            className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-xl transform scale-75 group-hover:scale-100 transition-all cursor-pointer"
                                            title="حذف الصورة"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {item.title && (
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-white text-sm font-bold truncate text-right">{item.title}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {backstageItems.length === 0 && (
                        <div className="text-center py-24 bg-[#1a1a1a] rounded-3xl border border-white/5 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <p className="text-gray-500 font-medium">لا توجد صور كواليس مضافة حالياً</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 py-6 border-t border-white/5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="text-white bg-white/10 px-3 py-1 rounded-lg">{page}</span>
                            <span className="text-gray-500">من</span>
                            <span className="text-gray-400">{totalPages}</span>
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={(open) => {
                setIsUploadOpen(open);
                if (!open) {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setTitle('');
                }
            }}>
                <DialogContent className="max-w-xl bg-[#1a1a1a] border-white/10 text-white p-6 overflow-hidden rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Camera className="text-primary w-5 h-5" />
                            إضافة صورة كواليس جديدة
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-6 mt-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all bg-black/20 group relative overflow-hidden">
                            {previewUrl ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 p-2 flex items-center justify-center">
                                    <Image 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        fill 
                                        className="object-cover" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        className="absolute top-2 left-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-xl transition-all z-10 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center cursor-pointer space-y-4 w-full">
                                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="h-8 w-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-sm">اسحب الصورة أو اضغط للرفع</p>
                                        <p className="text-gray-500 text-xs mt-1">PNG, JPG (يفضل صور عالية الجودة)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
                                </label>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">عنوان الصورة (اختياري)</label>
                            <input 
                                type="text" 
                                placeholder="مثال: خلف كواليس تصوير المشهد الأخير..." 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button type="button" onClick={() => setIsUploadOpen(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-all font-bold cursor-pointer">إلغاء</button>
                            <button
                                type="submit"
                                disabled={!selectedFile || submitting}
                                className="bg-primary hover:bg-primary-dark text-black px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-20 active:scale-95 cursor-pointer"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                اعتماد وإضافة الصورة
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-sm rounded-2xl">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">حذف صورة الكواليس؟</DialogTitle>
                        <p className="text-center text-gray-400 text-sm mt-2">سيتم إزالة هذه الصورة من واجهة الموقع نهائياً.</p>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white cursor-pointer">إلغاء</Button>
                        <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer">تأكيد الحذف</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
