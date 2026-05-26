'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { fetchApi, API_URL } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { FilePicker } from '@/components/ui/file-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  Info,
  Link as LinkIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Commercial {
  id: number;
  title?: string | null;
  coverImage?: string | null;
  thumbnailImage?: string | null;
  youtubeTrailerLink?: string | null;
  seoImage?: string | null;
  releaseYear?: string | null;
  meta?: string | null;
  synopsis?: string | null;
  director?: string | null;
  writer?: string | null;
  dop?: string | null;
  music?: string | null;
  editor?: string | null;
  cast?: string | null;
  stills?: string[] | string | null;
  sortOrder?: number | null;
}

interface CommercialFormData {
  title: string;
  releaseYear: string;
  meta: string;
  synopsis: string;
  director: string;
  writer: string;
  dop: string;
  music: string;
  editor: string;
  cast: string;
  youtubeTrailerLink: string;
  sortOrder: string;
}

const LIMIT = 10;

const EMPTY_FORM: CommercialFormData = {
  title: '',
  releaseYear: '',
  meta: '',
  synopsis: '',
  director: '',
  writer: '',
  dop: '',
  music: '',
  editor: '',
  cast: '',
  youtubeTrailerLink: '',
  sortOrder: '0',
};

const inputClass =
  'w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-primary outline-none transition-all';

const textareaClass =
  'w-full min-h-28 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs leading-6 focus:border-primary outline-none transition-all resize-y';

function getImageUrl(image?: string | null) {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
}

function getPrimaryImage(commercial: Commercial) {
  return getImageUrl(commercial.coverImage || commercial.thumbnailImage);
}

function getStillsArray(stills?: string[] | string | null) {
  if (!stills) return [];
  if (Array.isArray(stills)) return stills.filter(Boolean);

  return stills
    .split(',')
    .map((still) => still.trim())
    .filter(Boolean);
}

function MultiImagePicker({
  label,
  files,
  currentImages,
  onChange,
}: {
  label: string;
  files: File[];
  currentImages: string[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const imagesToShow = previewUrls.length > 0 ? previewUrls : currentImages.map(getImageUrl);

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onChange(Array.from(e.target.files || []))}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 px-4 rounded-xl border-2 border-dashed border-glass-border bg-white/[0.02] hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">اختر مجموعة صور</span>
          <span className="text-[10px] text-gray-500">PNG, JPG, WEBP</span>
        </div>
      </button>

      {files.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          إزالة الصور المختارة
        </button>
      )}

      {imagesToShow.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {imagesToShow.map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <Image src={image} alt={`Still ${index + 1}`} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommercialsPage() {
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [files, setFiles] = useState<{ cover?: File; stills: File[] }>({ stills: [] });
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [currentStills, setCurrentStills] = useState<string[]>([]);
  const [formData, setFormData] = useState<CommercialFormData>({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewCommercial, setViewCommercial] = useState<Commercial | null>(null);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/commercials?page=${page}&limit=${LIMIT}`);
      setCommercials(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setFiles({ stills: [] });
    setCurrentCover(null);
    setRemoveCover(false);
    setCurrentStills([]);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !files.cover) {
      toast.error('يرجى رفع صورة الغلاف');
      return;
    }

    const body = new FormData();
    body.append('title', formData.title);
    body.append('releaseYear', formData.releaseYear);
    body.append('meta', formData.meta);
    body.append('synopsis', formData.synopsis);
    body.append('director', formData.director);
    body.append('writer', formData.writer);
    body.append('dop', formData.dop);
    body.append('music', formData.music);
    body.append('editor', formData.editor);
    body.append('cast', formData.cast);
    body.append('youtubeTrailerLink', formData.youtubeTrailerLink);
    body.append('sortOrder', formData.sortOrder);

    if (files.cover) {
      body.append('coverImage', files.cover);
    }

    if (editingId && removeCover) {
      body.append('removeCoverImage', 'true');
    }

    files.stills.forEach((file) => {
      body.append('stills', file);
    });

    const toastId = toast.loading(editingId ? 'جاري تحديث الإعلان...' : 'جاري إضافة الإعلان...');

    try {
      if (editingId) {
        await fetchApi(`/commercials/${editingId}`, { method: 'PUT', body });
        toast.success('تم تحديث الإعلان بنجاح', { id: toastId });
      } else {
        await fetchApi('/commercials', { method: 'POST', body });
        toast.success('تم إضافة الإعلان بنجاح', { id: toastId });
      }

      resetForm();
      setIsFormOpen(false);
      loadData();
    } catch {
      toast.error('حدث خطأ أثناء الحفظ. تأكد من إدخال البيانات بشكل صحيح.', { id: toastId });
    }
  };

  const handleEdit = (commercial: Commercial) => {
    setEditingId(commercial.id);
    setFormData({
      title: commercial.title || '',
      releaseYear: commercial.releaseYear || '',
      meta: commercial.meta || '',
      synopsis: commercial.synopsis || '',
      director: commercial.director || '',
      writer: commercial.writer || '',
      dop: commercial.dop || '',
      music: commercial.music || '',
      editor: commercial.editor || '',
      cast: commercial.cast || '',
      youtubeTrailerLink: commercial.youtubeTrailerLink || '',
      sortOrder: commercial.sortOrder?.toString() || '0',
    });
    setFiles({ stills: [] });
    setCurrentCover(commercial.coverImage || null);
    setRemoveCover(false);
    setCurrentStills(getStillsArray(commercial.stills));
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const toastId = toast.loading('جاري الحذف...');
    try {
      await fetchApi(`/commercials/${deleteId}`, { method: 'DELETE' });
      toast.success('تم حذف الإعلان بنجاح', { id: toastId });
      setDeleteId(null);
      loadData();
    } catch {
      toast.error('فشل عملية الحذف', { id: toastId });
    }
  };

  const updateField = (field: keyof CommercialFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const renderInput = (
    field: keyof CommercialFormData,
    label: string,
    placeholder = '',
    type = 'text',
  ) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
        className={inputClass}
      />
    </div>
  );

  const renderTextarea = (field: keyof CommercialFormData, label: string, placeholder = '') => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">{label}</label>
      <textarea
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
        className={textareaClass}
      />
    </div>
  );

  const detailRows = viewCommercial
    ? [
        { label: 'Meta', value: viewCommercial.meta },
        { label: 'الإخراج', value: viewCommercial.director },
        { label: 'التأليف', value: viewCommercial.writer },
        { label: 'التصوير', value: viewCommercial.dop },
        { label: 'الموسيقى', value: viewCommercial.music },
        { label: 'المونتاج', value: viewCommercial.editor },
        { label: 'البطولة', value: viewCommercial.cast },
      ].filter((item) => item.value)
    : [];
  const viewStills = getStillsArray(viewCommercial?.stills);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">إدارة الإعلانات</h1>
            <p className="text-gray-400 text-sm mt-1">إضافة وتعديل تفاصيل الإعلانات في المنصة</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateForm}
              className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة إعلان جديد</span>
            </button>

            <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl">
              <span className="text-primary font-bold text-lg">{total}</span>
              <span className="text-gray-400 text-sm mr-2">إجمالي الإعلانات</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> قائمة الإعلانات الحالية
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
                {commercials.map((commercial) => {
                  const imageUrl = getPrimaryImage(commercial);

                  return (
                    <tr key={commercial.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 mx-auto">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={commercial.title || 'Work'} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/10">
                              <Film className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{commercial.title || 'بدون عنوان'}</span>
                          <span className="text-xs text-gray-500">{commercial.releaseYear || commercial.meta || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-gray-400 truncate max-w-[150px] inline-block">
                          {commercial.youtubeTrailerLink || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-white">
                          {commercial.sortOrder ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewCommercial(commercial)}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(commercial)}
                            className="p-2 rounded-lg bg-white/5 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(commercial.id)}
                            className="p-2 rounded-lg bg-white/5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {commercials.length === 0 && !isLoading && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <Film className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد إعلانات مضافة حالياً في هذا القسم</p>
              </div>
            )}

            {isLoading && (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      p === page
                        ? 'bg-primary text-black'
                        : 'bg-[#1a1a1a] border border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              معروض {commercials.length} من أصل {total} إعلان
            </p>
          </div>
        )}
      </div>

<Dialog
  open={isFormOpen}
  onOpenChange={(open) => {
    setIsFormOpen(open);
    if (!open) resetForm();
  }}
>
  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-white/10 text-white p-0 rounded-2xl">

    {/* HEADER */}
    <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
      {editingId ? (
        <Pencil className="w-5 h-5 text-primary" />
      ) : (
        <Plus className="w-5 h-5 text-primary" />
      )}

      <h2 className="text-lg font-bold">
        {editingId ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
      </h2>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="p-6 space-y-8">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* COVER */}
        <div className="space-y-3">

          {editingId && currentCover && !removeCover && !files.cover && (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <Image
                src={getImageUrl(currentCover)}
                alt="cover"
                fill
                className="object-cover"
                unoptimized
              />

              <button
                type="button"
                onClick={() => setRemoveCover(true)}
                className="absolute top-2 left-2 px-2 py-1 text-[10px] bg-red-600 rounded-md"
              >
                حذف
              </button>
            </div>
          )}

          <FilePicker
            label="صورة الغلاف"
            onChange={(file) => {
              if (file) setRemoveCover(false);
              setFiles((c) => ({ ...c, cover: file || undefined }));
            }}
          />

          <p className="text-[10px] text-gray-500 text-center">
            صورة واضحة تعبر عن الإعلان
          </p>
        </div>

        {/* MAIN FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* كل واحد بسطر كامل */}
          <div className="md:col-span-2">
            {renderInput('title', 'اسم الإعلان')}
          </div>

          <div className="md:col-span-2">
            {renderInput('meta', 'Meta')}
          </div>

          {/* باقي الحقول */}
          {renderInput('releaseYear', 'السنة')}
          {renderInput('sortOrder', 'الترتيب', '', 'number')}

          <div className="md:col-span-2">
            {renderInput('youtubeTrailerLink', 'رابط الفيديو')}
          </div>

        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        {renderTextarea('synopsis', 'الوصف')}
      </div>

      {/* CREW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput('director', 'الإخراج')}
        {renderInput('writer', 'التأليف')}
        {renderInput('dop', 'التصوير')}
        {renderInput('music', 'الموسيقى')}
        {renderInput('editor', 'المونتاج')}
        {renderInput('cast', 'البطولة')}
      </div>

      {/* STILLS */}
      <div>
        <MultiImagePicker
          label="صور الإعلان"
          files={files.stills}
          currentImages={currentStills}
          onChange={(files) =>
            setFiles((c) => ({ ...c, stills: files }))
          }
        />
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">

        <button
          type="button"
          onClick={() => setIsFormOpen(false)}
          className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition"
        >
          إلغاء
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/80 transition flex items-center gap-2"
        >
          {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? 'حفظ التغييرات' : 'إضافة الإعلان'}
        </button>

      </div>
    </form>
  </DialogContent>
</Dialog>

      <Dialog open={!!viewCommercial} onOpenChange={() => setViewCommercial(null)}>
        <DialogContent className="max-w-3xl bg-[#1a1a1a] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
          {viewCommercial && (
            <>
              <div className="relative h-72 w-full">
                {getPrimaryImage(viewCommercial) ? (
                  <Image
                    src={getPrimaryImage(viewCommercial)}
                    alt={viewCommercial.title || 'Work'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white/5">
                    <Film className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                <button
                  onClick={() => setViewCommercial(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 px-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-300 text-xs">{viewCommercial.releaseYear || viewCommercial.meta || '-'}</span>
                  </div>
                  <h3 className="text-3xl font-black">{viewCommercial.title || 'بدون عنوان'}</h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> الوصف
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    { viewCommercial.synopsis || 'لا يوجد وصف مضاف لهذا الإعلان.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> تاريخ الإصدار
                    </p>
                    <p className="text-white font-medium">{viewCommercial.releaseYear || '-'}</p>
                  </div>

                  {viewCommercial.youtubeTrailerLink && (
                    <a
                      href={viewCommercial.youtubeTrailerLink}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-red-600/15 border border-red-500/20 p-4 rounded-2xl space-y-1 hover:bg-red-600/25 transition-colors"
                    >
                      <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3" /> الرابط الخارجي
                      </p>
                      <p className="text-white font-medium text-sm truncate">مشاهدة الإعلان</p>
                    </a>
                  )}
                </div>

                {detailRows.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailRows.map((item) => (
                      <div key={item.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="text-white text-sm leading-6">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {viewStills.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest">صور من الإعلان</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {viewStills.map((still, index) => (
                        <div key={`${still}-${index}`} className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
                          <Image src={getImageUrl(still)} alt={`Still ${index + 1}`} fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">تأكيد حذف الإعلان؟</DialogTitle>
            <p className="text-center text-gray-400 text-sm mt-2">
              سيتم حذف هذا الإعلان وجميع الصور المرتبطة به نهائياً من السيرفر. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white cursor-pointer"
            >
              إلغاء
            </Button>
            <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer">
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
