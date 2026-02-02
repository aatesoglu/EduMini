import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, MessageSquare, PlusCircle, Users, Trash2, Edit, X, TrendingUp, DollarSign, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Cookies from 'js-cookie';

const InstructorDashboard = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

    // Form states
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        price: '',
        category: 'web',
        duration: '',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchMyCourses = async () => {
        try {
            const response = await api.get(`/courses?instructorId=${user?.id}`);
            if (response.data && response.data.status === 'success') {
                setCourses(response.data.data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyCourses();
        }
    }, [user]);

    const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('price', newCourse.price);
            formData.append('category', newCourse.category);
            formData.append('duration', newCourse.duration);
            formData.append('isPublished', 'false'); // Default olarak yayınlanmamış

            // Görsel yüklendiyse ekle
            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (newCourse.image) {
                // Eğer URL string olarak girilmişse (geriye dönük uyumluluk)
                formData.append('image', newCourse.image);
            }

            // CSRF token ekle
            const csrfToken = Cookies.get('XSRF-TOKEN');
            if (csrfToken) {
                formData.append('_csrf', csrfToken);
            }

            let response;
            if (editingCourseId) {
                response = await api.patch(`/courses/${editingCourseId}`, formData);
            } else {
                response = await api.post('/courses', formData);
            }

            if (response.data && response.data.status === 'success') {
                alert(editingCourseId ? 'Kurs başarıyla güncellendi!' : 'Kurs başarıyla oluşturuldu!');
                setShowAddModal(false);
                setEditingCourseId(null);
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchMyCourses();
                setNewCourse({
                    title: '',
                    description: '',
                    price: '',
                    category: 'web',
                    duration: '',
                    image: ''
                });
            } else {
                alert(response.data.message || 'Hata oluştu');
            }
        } catch (error: any) {
            console.error("Error saving course:", error);
            alert(`Bir hata oluştu: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            // URL input'unu temizle
            setNewCourse({ ...newCourse, image: '' });
        }
    };

    const handleEditClick = (course: any) => {
        setEditingCourseId(course.id);
        setNewCourse({
            title: course.title,
            description: course.description,
            price: course.price,
            category: course.category,
            duration: course.duration,
            image: course.image || ''
        });
        setSelectedFile(null);
        // Mevcut görseli preview olarak göster
        if (course.image) {
            if (course.image.startsWith('http')) {
                setPreviewUrl(course.image);
            } else {
                setPreviewUrl(`http://localhost:5000${course.image}`);
            }
        } else {
            setPreviewUrl(null);
        }
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingCourseId(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setNewCourse({
            title: '',
            description: '',
            price: '',
            category: 'web',
            duration: '',
            image: ''
        });
    };

    const handleDeleteCourse = async (id: number) => {
        if (!window.confirm('Bu kursu silmek istediğinize emin misiniz?')) return;

        try {
            await api.delete(`/courses/${id}`);
            alert('Kurs silindi');
            fetchMyCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert('Silme işlemi başarısız');
        }
    };

    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);

    const fetchCourseReviews = async (courseId: number) => {
        try {
            const response = await api.get(`/reviews/course/${courseId}`);
            if (response.data && response.data.status === 'success') {
                setReviews(response.data.data.reviews);
                setSelectedCourseId(courseId);
                setShowReviewsModal(true);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleReplyToReview = async (reviewId: number) => {
        if (!replyText.trim()) return;

        try {
            const response = await api.post(`/reviews/${reviewId}/reply`, { reply: replyText });

            if (response.data && response.data.status === 'success') {
                // Update local state
                setReviews(reviews.map(review =>
                    review.id === reviewId ? { ...review, reply: replyText } : review
                ));
                setReplyingToReviewId(null);
                setReplyText('');
                alert('Cevap başarıyla gönderildi.');
            } else {
                alert(response.data.message || 'Cevap gönderilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error("Error replying to review:", error);
            alert('Bir hata oluştu.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Welcome Section */}
            <div className="bg-indigo-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                <TrendingUp size={48} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Eğitmen Paneli</h1>
                                <p className="mt-2 text-indigo-100">Hoş geldiniz, {user?.username}. Kurslarınızı ve öğrencilerinizi buradan yönetin.</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    setEditingCourseId(null);
                                    setShowAddModal(true);
                                }}
                                className="hidden sm:flex items-center space-x-2 bg-white text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg font-medium"
                            >
                                <PlusCircle size={20} />
                                <span>Yeni Kurs Ekle</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-indigo-800 text-white px-4 py-3 rounded-lg hover:bg-indigo-900 transition-colors shadow-lg font-medium border border-indigo-600"
                            >
                                <LogOut size={20} />
                                <span>Çıkış</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-blue-500">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Aktif Kurslar</p>
                            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-green-500">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Toplam Öğrenci</p>
                            <p className="text-2xl font-bold text-gray-900">1,234</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-purple-500">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Toplam Kazanç</p>
                            <p className="text-2xl font-bold text-gray-900">₺12,450</p>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Kurs Yönetimi</h2>
                        <button
                            onClick={() => {
                                setEditingCourseId(null);
                                setShowAddModal(true);
                            }}
                            className="sm:hidden flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                            <PlusCircle size={16} />
                            <span>Ekle</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-gray-500">Yükleniyor...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                <BookOpen size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Henüz bir kursunuz bulunmuyor</h3>
                            <p className="mt-1 text-gray-500">İlk kursunuzu oluşturarak öğrencilere ulaşmaya başlayın.</p>
                            <button
                                onClick={() => {
                                    setEditingCourseId(null);
                                    setShowAddModal(true);
                                }}
                                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Yeni Kurs Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurs Bilgisi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img 
                                                            className="h-10 w-10 rounded-lg object-cover" 
                                                            src={
                                                                course.image 
                                                                    ? (course.image.startsWith('http') 
                                                                        ? course.image 
                                                                        : course.image.startsWith('/')
                                                                        ? `http://localhost:5000${course.image}`
                                                                        : `http://localhost:5000/img/${course.image}`)
                                                                    : 'https://via.placeholder.com/40?text=Course'
                                                            } 
                                                            alt="" 
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {course.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {course.price} ₺
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Yayında
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => fetchCourseReviews(course.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Yorumlar"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(course)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Düzenle">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCourse(course.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{editingCourseId ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}</h2>
                                <p className="text-sm text-gray-500">Kurs detaylarını girerek yeni bir eğitim oluşturun.</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdateCourse} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kurs Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                    placeholder="Örn: Sıfırdan İleri Seviye React"
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newCourse.category}
                                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                                    >
                                        <option value="web">Web Geliştirme</option>
                                        <option value="mobil">Mobil Uygulama</option>
                                        <option value="veri-bilimi">Veri Bilimi</option>
                                        <option value="yapay-zeka">Yapay Zeka</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            className="w-full pl-7 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                            value={newCourse.price}
                                            onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Süre (Saat)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Örn: 12.5"
                                    value={newCourse.duration}
                                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Kurs içeriği hakkında detaylı bilgi verin..."
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kurs Görseli</label>
                                <div className="space-y-2">
                                    {previewUrl && (
                                        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF veya WEBP (Maks. 5MB)</p>
                                    {!selectedFile && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 mb-1">veya URL ile:</p>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="https://example.com/image.jpg"
                                                value={newCourse.image}
                                                onChange={(e) => {
                                                    setNewCourse({ ...newCourse, image: e.target.value });
                                                    if (e.target.value) {
                                                        setPreviewUrl(e.target.value);
                                                        setSelectedFile(null);
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                                >
                                    {editingCourseId ? 'Kursu Güncelle' : 'Kurs Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            {showReviewsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Kurs Yorumları</h2>
                                <p className="text-sm text-gray-500">Öğrencilerinizin yaptığı yorumlar ve değerlendirmeler.</p>
                            </div>
                            <button onClick={() => setShowReviewsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Bu kurs için henüz yorum yapılmamış.
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-gray-900">{review.User?.username || 'Öğrenci'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-400 text-sm">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-3">{review.review}</p>

                                        {review.reply ? (
                                            <div className="bg-white p-3 rounded border border-gray-200 ml-4 text-sm">
                                                <div className="font-semibold text-indigo-600 mb-1">Eğitmen Cevabı:</div>
                                                <p className="text-gray-600">{review.reply}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {replyingToReviewId === review.id ? (
                                                    <div className="mt-2">
                                                        <textarea
                                                            className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                                                            rows={3}
                                                            placeholder="Cevabınızı yazın..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingToReviewId(null);
                                                                    setReplyText('');
                                                                }}
                                                                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                                                            >
                                                                İptal
                                                            </button>
                                                            <button
                                                                onClick={() => handleReplyToReview(review.id)}
                                                                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                            >
                                                                Gönder
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setReplyingToReviewId(review.id);
                                                            setReplyText('');
                                                        }}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Cevapla
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;


