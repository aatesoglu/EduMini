import { useState, useEffect } from 'react';
import { BookOpen, Edit, Trash2, MessageSquare, PlusCircle, X, Search } from 'lucide-react';
import api from '../../utils/api';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    instructor: {
        username: string;
    };
    createdAt: string;
}

interface Review {
    id: number;
    review: string;
    rating: number;
    user: {
        username: string;
    };
    createdAt: string;
    reply?: string;
}

export default function AdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Review Modal States
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            if (response.data.status === 'success') {
                setCourses(response.data.data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu kursu silmek istediğinize emin misiniz?')) return;

        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(course => course.id !== id));
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Kurs silinirken bir hata oluştu.');
        }
    };

    const fetchCourseReviews = async (courseId: number) => {
        try {
            const response = await api.get(`/reviews/course/${courseId}`);
            if (response.data.status === 'success') {
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
            const response = await api.post(`/reviews/${reviewId}/reply`, {
                reply: replyText
            });

            if (response.data.status === 'success') {
                setReviews(reviews.map(review =>
                    review.id === reviewId ? { ...review, reply: replyText } : review
                ));
                setReplyingToReviewId(null);
                setReplyText('');
                alert('Cevap başarıyla gönderildi.');
            }
        } catch (error) {
            console.error("Error replying to review:", error);
            alert('Cevap gönderilirken bir hata oluştu.');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="mr-3" size={32} />
                    Kurs Yönetimi
                </h1>
                {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <PlusCircle size={20} />
                    Yeni Kurs Ekle
                </button> */}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Kurs veya eğitmen ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Kurslar yükleniyor...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eğitmen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 rounded-lg object-cover" src={course.image} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {course.instructor?.username || 'Bilinmiyor'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {course.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {course.price} ₺
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => fetchCourseReviews(course.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Yorumları Yönet"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
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
                </div>
            )}

            {/* Reviews Modal */}
            {showReviewsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Kurs Yorumları</h2>
                                <p className="text-sm text-gray-500">Kursa yapılan yorumları yönetin ve cevaplayın.</p>
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
                                                <div className="font-semibold text-blue-600 mb-1">Yönetici/Eğitmen Cevabı:</div>
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
                                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
}
