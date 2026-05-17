'use client';

import { useState, useEffect } from 'react';
import { fetchApi, API_URL } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { FilePicker } from '@/components/ui/file-picker';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Eye, Plus, X, Film, Calendar, Link as LinkIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface Show {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  thumbnailImage: string;
  youtubeTrailerLink: string;
  sortOrder: number;
  releaseYear: string;
}

const LIMIT = 10;

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [files, setFiles] = useState<{ cover?: File, thumbnail?: File }>({});
  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    youtubeTrailerLink: '',
    sortOrder: '0',
  });

  // Modal States
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewShow, setViewShow] = useState<Show | null>(null);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/shows?page=${page}&limit=${LIMIT}`);
      setShows(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = new FormData();
    body.append('title', formData.title);
    body.append('releaseYear', formData.releaseYear);
    body.append('description', '');
    body.append('youtubeTrailerLink', formData.youtubeTrailerLink);
    body.append('sortOrder', formData.sortOrder);
    
    if (files.cover) body.append('coverImage', files.cover);
    if (files.thumbnail) body.append('thumbnailImage', files.thumbnail);

    const toastId = toast.loading(editingId ? 'جاري تحديث العمل...' : 'جاري إضافة العمل...');

    try {
        if (editingId) {
          await fetchApi(`/shows/${editingId}`, { method: 'PUT', body });
          toast.success('تم تحديث العمل بنجاح', { id: toastId });
          setEditingId(null);
        } else {
          if (!files.thumbnail) {
            toast.error('يرجى رفع الصورة', { id: toastId });
            return;
          }
          await fetchApi('/shows', { method: 'POST', body });
          toast.success('تم إضافة العمل بنجاح', { id: toastId });
        }
        setFormData({ title: '', releaseYear: '', youtubeTrailerLink: '', sortOrder: '0' });
        setFiles({});
        setIsFormOpen(false);
        loadData();
    } catch (err) {
        toast.error('حدث خطأ أثناء الحفظ. تأكد من إدخال جميع البيانات.', { id: toastId });
    }
  };

  const handleEdit = (show: Show) => {
    setEditingId(show.id);
    setFormData({
      title: show.title || '',
      releaseYear: show.releaseYear || '',
      youtubeTrailerLink: show.youtubeTrailerLink || '',
      sortOrder: show.sortOrder?.toString() || '0',
    });
    setFiles({});
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading('جاري الحذف...');
    try {
      await fetchApi(`/shows/${deleteId}`, { method: 'DELETE' });
      toast.success('تم حذف العمل بنجاح', { id: toastId });
      setDeleteId(null);
      loadData();
    } catch (err) {
      toast.error('فشل عملية الحذف', { id: toastId });
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">إدارة الأعمال</h1>
            <p className="text-gray-400 text-sm mt-1">إضافة وتعديل الأفلام والمسلسلات في المنصة</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => {
              setEditingId(null);
              setFormData({ title: '', releaseYear: '', youtubeTrailerLink: '', sortOrder: '0' });
              setFiles({});
              setIsFormOpen(true);
            }} className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer">
              <Plus className="w-5 h-5" />
              <span>إضافة عمل جديد</span>
            </button>

            <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl">
              <span className="text-primary font-bold text-lg">{total}</span>
              <span className="text-gray-400 text-sm mr-2">إجمالي الأعمال</span>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> قائمة الأعمال الحالية
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-[0.2em] font-bold border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4">الصورة</th>
                  <th className="px-6 py-4 text-right">الاسم والسنة</th>
                  <th className="px-6 py-4 text-center">الرابط</th>
                  <th className="px-6 py-4 text-center">الترتيب</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shows.map(show => (
                  <tr key={show.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 mx-auto">
                        {show.thumbnailImage ? (
                          <Image src={`${API_URL}/uploads/${show.thumbnailImage}`} alt="Work" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/10"><Film className="w-6 h-6" /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{show.title || 'بدون عنوان'}</span>
                        <span className="text-xs text-gray-500">{show.releaseYear || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs text-gray-400 truncate max-w-[150px] inline-block">{show.youtubeTrailerLink || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-white">{show.sortOrder ?? 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewShow(show)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer" title="عرض التفاصيل">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(show)} className="p-2 rounded-lg bg-white/5 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer" title="تعديل">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(show.id)} className="p-2 rounded-lg bg-white/5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shows.length === 0 && !isLoading && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <Film className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد أعمال مضافة حالياً في هذا القسم</p>
              </div>
            )}
            {isLoading && (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${p === page ? 'bg-primary text-black' : 'bg-[#1a1a1a] border border-white/5 text-gray-400 hover:border-white/20'}`}>
                    {p}
                  </button>
                ))}
              </div>

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">معروض {shows.length} من أصل {total} عمل فني</p>
          </div>
        )}
      </div>

      {/* Add / Edit Show Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingId(null);
          setFormData({ title: '', releaseYear: '', youtubeTrailerLink: '', sortOrder: '0' });
          setFiles({});
        }
      }}>
        <DialogContent className="max-w-2xl bg-[#1a1a1a] border-white/10 text-white p-6 overflow-hidden rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Film className="text-primary w-5 h-5" />
              {editingId ? 'تعديل العمل الفني' : 'إضافة عمل فني جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">الصورة (Portrait)</label>
                <div className="grid grid-cols-1 gap-4">
                  <FilePicker label="رفع الصورة" onChange={f => setFiles({...files, thumbnail: f || undefined})} />
                  {editingId && (
                    <p className="text-[10px] text-gray-500 text-center">اتركه فارغاً للاحتفاظ بالصورة الحالية</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">اسم العمل (اختياري)</label>
                  <input type="text" placeholder="مثال: مسلسل عفو عام" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">سنة الإصدار (اختياري)</label>
                  <input type="text" placeholder="مثال: 2026" value={formData.releaseYear} onChange={e => setFormData({...formData, releaseYear: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">رابط الفيديو (YouTube)</label>
                  <input type="text" placeholder="https://youtube.com/..." value={formData.youtubeTrailerLink} onChange={e => setFormData({...formData, youtubeTrailerLink: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">ترتيب العرض</label>
                  <input type="number" placeholder="0" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all" required />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-all font-bold cursor-pointer">إلغاء</button>
              <button type="submit" className="bg-primary hover:bg-primary-dark text-black px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'حفظ التغييرات' : 'إضافة للكاتالوج'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Show Modal */}
      <Dialog open={!!viewShow} onOpenChange={() => setViewShow(null)}>
        <DialogContent className="max-w-2xl bg-[#1a1a1a] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
          {viewShow && (
            <>
              <div className="relative h-64 w-full">
                {viewShow.coverImage ? (
                  <Image src={`${API_URL}/uploads/${viewShow.coverImage}`} alt={viewShow.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white/5"><Film className="w-20 h-20" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <button onClick={() => setViewShow(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 px-8 flex items-end gap-6">
                  <div className="relative w-24 h-36 rounded-xl shadow-2xl border-2 border-white/10 overflow-hidden bg-[#222]">
                    <Image src={`${API_URL}/uploads/${viewShow.thumbnailImage}`} alt={viewShow.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs">{viewShow.releaseYear}</span>
                    </div>
                    <h3 className="text-2xl font-black">{viewShow.title}</h3>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-2 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> قصة العمل
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{viewShow.description || 'لا يوجد وصف مضاف لهذا العمل.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> تاريخ الإصدار
                    </p>
                    <p className="text-white font-medium">{viewShow.releaseYear || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> الروابط الخارجية
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {viewShow.youtubeTrailerLink ? (
                      <a href={viewShow.youtubeTrailerLink} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all">
                        <Film className="w-4 h-4" /> مشاهدة الإعلان
                      </a>
                    ) : (
                      <div className="px-4 py-2 rounded-xl bg-white/5 text-gray-600 text-xs font-bold">لا يوجد رابط إعلان</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">تأكيد حذف العمل؟</DialogTitle>
            <p className="text-center text-gray-400 text-sm mt-2">سيتم حذف هذا العمل وجميع الصور المرتبطة به نهائياً من السيرفر. لا يمكن التراجع عن هذا الإجراء.</p>
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