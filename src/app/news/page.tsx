'use client';

import { useState, useEffect } from 'react';
import { fetchApi, API_URL } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { FilePicker } from '@/components/ui/file-picker';
import { Pencil, Trash2, Eye, Plus, Newspaper, Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
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
import { slugify } from '@/lib/slug';

interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string;
  date: string;
  createdAt: string;
}

const LIMIT = 10;

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Modal States
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewNews, setViewNews] = useState<News | null>(null);

  useEffect(() => {
    loadNews();
  }, [page]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/news?page=${page}&limit=${LIMIT}`);
      setNewsList(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('فشل تحميل الأخبار');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const body = new FormData();
    body.append('title', formData.title);
    body.append('content', formData.content);
    body.append('date', new Date(formData.date).toISOString());
    if (formData.slug.trim()) {
      body.append('slug', formData.slug.trim());
    }

    if (file) body.append('image', file);

    const toastId = toast.loading(editingId ? 'جاري تحديث الخبر...' : 'جاري إضافة الخبر...');

    try {
        if (editingId) {
          await fetchApi(`/news/${editingId}`, { method: 'PUT', body });
          toast.success('تم تحديث الخبر بنجاح', { id: toastId });
          setEditingId(null);
        } else {
          await fetchApi('/news', { method: 'POST', body });
          toast.success('تم إضافة الخبر بنجاح', { id: toastId });
        }
        setFormData({ title: '', slug: '', content: '', date: new Date().toISOString().split('T')[0] });
        setSlugTouched(false);
        setFile(null);
        setIsFormOpen(false);
        loadNews();
    } catch (err) {
        toast.error('حدث خطأ أثناء الحفظ', { id: toastId });
    }
  };

  const handleEdit = (news: News) => {
    setEditingId(news.id);
    setFormData({
      title: news.title,
      slug: news.slug || '',
      content: news.content,
      date: new Date(news.date).toISOString().split('T')[0]
    });
    setSlugTouched(true);
    setFile(null);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading('جاري الحذف...');
    try {
      await fetchApi(`/news/${deleteId}`, { method: 'DELETE' });
      toast.success('تم حذف الخبر بنجاح', { id: toastId });
      setDeleteId(null);
      loadNews();
    } catch (err) {
      toast.error('فشل عملية الحذف', { id: toastId });
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">إدارة الأخبار</h1>
            <p className="text-gray-400 text-sm mt-1">إضافة وتعديل الأخبار والمستجدات</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => {
              setEditingId(null);
              setFormData({ title: '', slug: '', content: '', date: new Date().toISOString().split('T')[0] });
              setSlugTouched(false);
              setFile(null);
              setIsFormOpen(true);
            }} className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer">
              <Plus className="w-5 h-5" />
              <span>إضافة خبر جديد</span>
            </button>

            <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl">
              <span className="text-primary font-bold text-lg">{total}</span>
              <span className="text-gray-400 text-sm mr-2">إجمالي الأخبار</span>
            </div>
          </div>
        </div>
        
        {/* Data Table Section */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" /> قائمة الأخبار
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-[0.2em] font-bold border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4">الخبر</th>
                  <th className="px-6 py-4 text-center">التاريخ</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {newsList.map(news => (
                  <tr key={news.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                          {news.image ? (
                            <Image src={`${API_URL}/uploads/${news.image}`} alt={news.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/10"><Newspaper className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors">{news.title}</p>
                          {news.slug && (
                            <p className="text-[10px] text-primary/80 mt-1 font-mono" dir="rtl">{news.slug}</p>
                          )}
                          <p className="text-[11px] text-gray-500 line-clamp-1 max-w-[300px] mt-1">{news.content}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-400">{new Date(news.date).toLocaleDateString('ar-IQ')}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewNews(news)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(news)} className="p-2 rounded-lg bg-white/5 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(news.id)} className="p-2 rounded-lg bg-white/5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newsList.length === 0 && !isLoading && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <Newspaper className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد أخبار مضافة حالياً</p>
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
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">معروض {newsList.length} من أصل {total} خبر</p>
          </div>
        )}
      </div>

      {/* Add / Edit News Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingId(null);
          setFormData({ title: '', slug: '', content: '', date: new Date().toISOString().split('T')[0] });
          setSlugTouched(false);
          setFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl bg-[#1a1a1a] border-white/10 text-white p-6 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Newspaper className="text-primary w-5 h-5" />
              {editingId ? 'تعديل الخبر' : 'إضافة خبر جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">عنوان الخبر</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug: slugTouched ? prev.slug : slugify(title),
                    }));
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">رابط الخبر (Slug)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setFormData({ ...formData, slug: e.target.value });
                  }}
                  placeholder="يُولَّد تلقائياً من العنوان"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                />
                <p className="text-[10px] text-gray-500">يدعم العربية — مثال: علي-فاضل-يقدم-عملاً-جديداً</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">تاريخ الخبر</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all" required />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">صورة الخبر</label>
                <FilePicker label="اختر صورة" onChange={f => setFile(f)} />
                {editingId && (
                  <p className="text-[10px] text-gray-500 text-center">اتركه فارغاً للاحتفاظ بالصورة الحالية</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">محتوى الخبر</label>
                <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all resize-none" rows={5} required></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-all font-bold cursor-pointer">إلغاء</button>
              <button type="submit" className="bg-primary hover:bg-primary-dark text-black px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'حفظ التغييرات' : 'إضافة الخبر'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View News Modal */}
      <Dialog open={!!viewNews} onOpenChange={() => setViewNews(null)}>
        <DialogContent className="max-w-2xl bg-[#1a1a1a] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
          {viewNews && (
            <>
              <div className="relative h-64 w-full">
                {viewNews.image ? (
                  <Image src={`${API_URL}/uploads/${viewNews.image}`} alt={viewNews.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-white/5"><Newspaper className="w-20 h-20" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <button onClick={() => setViewNews(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 px-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-xs">{new Date(viewNews.date).toLocaleDateString('ar-IQ')}</span>
                  </div>
                  <h3 className="text-2xl font-black">{viewNews.title}</h3>
                </div>
              </div>
              <div className="p-8 pt-4">
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{viewNews.content}</p>
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
            <DialogTitle className="text-center text-xl font-bold">تأكيد حذف الخبر؟</DialogTitle>
            <p className="text-center text-gray-400 text-sm mt-2">سيتم حذف هذا الخبر نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
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
