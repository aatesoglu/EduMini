import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'news' | 'announcement';
    active: boolean;
    image?: string;
    createdAt: string; // Updated to match backend
}

const AnnouncementManager = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'announcement',
        active: true
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/announcements/admin/all');

            if (response.data && response.data.status === 'success') {
                setAnnouncements(response.data.data.announcements);
            }
        } catch (error: any) {
            console.error('Duyurular yüklenirken hata:', error);
            setError(error.response?.data?.message || 'Duyurular yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!isMounted) return;

            try {
                await fetchAnnouncements();
            } catch (error) {
                console.error('Veri yüklenirken hata oluştu:', error);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            console.log('AnnouncementManager bileşeni kaldırıldı');
        };
    }, [fetchAnnouncements]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `/announcements/${editingId}`
                : '/announcements';

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('content', formData.content.trim());
            formDataToSend.append('type', formData.type);
            formDataToSend.append('active', String(formData.active));

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            if (editingId) {
                await api.patch(url, formDataToSend);
            } else {
                await api.post(url, formDataToSend);
            }

            await fetchAnnouncements();
            closeModal();

            setFormData({
                title: '',
                content: '',
                type: 'announcement',
                active: true
            });
            setSelectedImage(null);

        } catch (error: any) {
            console.error('Duyuru kaydedilirken hata oluştu:', error);
            alert(`Duyuru kaydedilirken hata oluştu: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await api.delete(`/announcements/${id}`);

            await fetchAnnouncements();
            alert('Duyuru başarıyla silindi');

        } catch (error: any) {
            console.error('Duyuru silinirken hata:', error);
            alert(`Duyuru silinirken hata oluştu: ${error.response?.data?.message || error.message}`);
        }
    };

    const openModal = (announcement?: Announcement) => {
        if (announcement) {
            setEditingId(announcement.id);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type,
                active: announcement.active
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                content: '',
                type: 'announcement',
                active: true
            });
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                <span className="ml-4">Duyurular yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Hata!</p>
                <p>{error}</p>
                <button
                    onClick={fetchAnnouncements}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Duyuru Yönetimi</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Duyuru
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {announcements.map((announcement) => (
                            <tr key={announcement.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {announcement.image ? (
                                        <img
                                            src={`/img/announcements/${announcement.image}`}
                                            alt="Duyuru"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{announcement.content}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${announcement.type === 'news' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {announcement.type === 'news' ? 'Haber' : 'Duyuru'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {announcement.active ? (
                                        <span className="flex items-center text-green-600 text-sm">
                                            <Check className="w-4 h-4 mr-1" /> Aktif
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 text-sm">
                                            <X className="w-4 h-4 mr-1" /> Pasif
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(() => {
                                        if (!announcement.createdAt) return '-';
                                        const date = new Date(announcement.createdAt);
                                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('tr-TR');
                                    })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openModal(announcement)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingId ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">İçerik</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Görsel</label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedImage(e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept="image/*"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tip</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'news' | 'announcement' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="announcement">Duyuru</option>
                                    <option value="news">Haber</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Aktif</label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManager;
