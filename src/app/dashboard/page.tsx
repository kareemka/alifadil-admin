'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/admin-layout';
import { fetchApi, API_URL } from '@/lib/api';
import { Loader2, Film, Image as ImageIcon, Camera, Newspaper, Plus, Settings, ChevronLeft, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';

interface Stats {
  shows: number;
  backstage: number;
  news: number;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; href: string }> = ({ title, value, icon, color, href }) => (
  <Link href={href}>
    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer shadow-xl">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color}`}>
          {icon}
        </div>
        <div className="text-gray-600 group-hover:text-primary transition-colors">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-3xl font-black text-white font-display tracking-tight">{value}</p>
      </div>
    </div>
  </Link>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ shows: 0, backstage: 0, news: 0 });
  const [recentShows, setRecentShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [showsRes, backstageRes, newsRes] = await Promise.all([
        fetchApi('/shows?page=1&limit=5'),
        fetchApi('/backstage').catch(() => ({ total: 0 })),
        fetchApi('/news').catch(() => ({ total: 0 })),
      ]);

      // Shows handle paginated response
      const showsData = showsRes.data || (Array.isArray(showsRes) ? showsRes : []);
      const showsTotal = showsRes.total || (Array.isArray(showsRes) ? showsRes.length : 0);
      
      const backstageTotal = backstageRes.total || (Array.isArray(backstageRes) ? backstageRes.length : 0);
      const newsTotal = newsRes.total || (Array.isArray(newsRes) ? newsRes.length : 0);

      setStats({
        shows: showsTotal,
        backstage: backstageTotal,
        news: newsTotal,
      });

      setRecentShows(showsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">النظام يعمل بشكل سليم</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">لوحة القيادة</h1>
            <p className="text-gray-500 text-sm mt-1">مرحباً بك مجدداً، إليك آخر الإحصائيات لنشاط المنصة</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
              <Clock className="w-3.5 h-3.5" />
              <span>آخر تحديث: الآن</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <StatCard title="الأعمال الفنية" value={stats.shows.toString()} icon={<Film className="w-6 h-6" />} color="text-primary" href="/shows" />
          <StatCard title="صور كواليس" value={stats.backstage.toString()} icon={<Camera className="w-6 h-6" />} color="text-blue-500" href="/backstage" />
          <StatCard title="الأخبار والمستجدات" value={stats.news.toString()} icon={<Newspaper className="w-6 h-6" />} color="text-amber-500" href="/news" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Table */}
          <div className="lg:col-span-2 bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-white tracking-tight">أحدث الإضافات</h2>
              </div>
              <Link href="/shows" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                عرض الكل <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-600 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">العمل</th>
                    <th className="px-6 py-4 text-center">السنة</th>
                    <th className="px-6 py-4 text-left">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentShows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">لا يوجد أعمال مضافة مؤخراً</td>
                    </tr>
                  ) : recentShows.map((show) => (
                    <tr key={show.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                            {show.thumbnailImage && <Image src={`${API_URL}/uploads/${show.thumbnailImage}`} alt="" fill className="object-cover" unoptimized />}
                          </div>
                          <span className="font-bold text-white group-hover:text-primary transition-colors text-sm">{show.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 text-xs">{show.releaseYear}</td>
                      <td className="px-6 py-4 text-left">
                        <Link href="/shows" className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-all inline-block">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6 tracking-tight">إجراءات سريعة</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/shows" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">إضافة عمل فني</p>
                      <p className="text-[10px] text-gray-500">تحميل ملفات ووصف العمل</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-700 group-hover:text-primary transition-colors" />
                </Link>

                <Link href="/backstage" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">إضافة صور الكواليس</p>
                      <p className="text-[10px] text-gray-500">تحميل صور معرض الكواليس</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
                </Link>

                <Link href="/settings" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">إعدادات المنصة</p>
                      <p className="text-[10px] text-gray-500">تخصيص الهوية والمعلومات</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-700 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Platform Health/Info */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 p-6">
              <h3 className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">تحديثات المنصة</h3>
              <p className="text-white text-sm font-bold leading-relaxed">
                تم تفعيل نظام التحسين التلقائي للصور SEO والتنظيف الذكي للملفات المهملة في النظام.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                   <div className="w-6 h-6 rounded-full border-2 border-surface bg-zinc-800"></div>
                   <div className="w-6 h-6 rounded-full border-2 border-surface bg-zinc-700"></div>
                </div>
                <span className="text-[10px] text-primary/80 font-bold uppercase tracking-tighter">إصدار 2.1.0 المستقر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
