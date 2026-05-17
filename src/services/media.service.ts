import api from '@/lib/api';

export interface MediaFile {
    id: string;
    url: string;
    name: string;
    type: 'IMAGE' | 'GLB';
    size?: number;
    createdAt: string;
}

export interface PaginatedMedia {
    items: MediaFile[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const mediaService = {
    getAll: async (type?: 'IMAGE' | 'GLB', page = 1, limit = 20) => {
        const { data } = await api.get<PaginatedMedia>('/media', {
            params: { type, page, limit }
        });
        return data;
    },

    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<MediaFile>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    delete: async (id: string) => {
        await api.delete(`/media/${id}`);
    },

    deleteMultiple: async (ids: string[]) => {
        await api.post(`/media/delete-multiple`, { ids });
    }
};
