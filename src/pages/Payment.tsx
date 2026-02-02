import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, Calendar, Lock } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import { courses } from "../data/courses"; // Import static data
import { AuthContext } from '../context/AuthContext';

interface Course {
    id: number;
    title: string;
    image: string;
    price: number;
}

interface ApiResponse {
    status: string;
    data: {
        course: Course;
    };
}

const Payment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form states
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const { user, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        if (!authLoading && !user) {
            // Redirect to login if not authenticated
            navigate('/login', { state: { from: location } });
            return;
        }

        const fetchCourse = async () => {
            // 1. Try static data first
            const foundCourse = courses.find((c) => String(c.id) === String(courseId));

            if (foundCourse) {
                setCourse({
                    id: Number(foundCourse.id),
                    title: foundCourse.title,
                    image: foundCourse.image,
                    price: typeof foundCourse.price === 'string'
                        ? parseFloat((foundCourse.price as string).replace('₺', '').replace('.', '').replace(',', '.'))
                        : Number(foundCourse.price)
                } as any);
                return;
            }

            // 2. Fetch from API
            try {
                const response = await api.get(`/courses/${courseId}`);
                if (response.data.status === 'success') {
                    const apiCourse = response.data.data.course;
                    setCourse({
                        id: apiCourse.id,
                        title: apiCourse.title,
                        image: apiCourse.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
                        price: apiCourse.price
                    } as any);
                } else {
                    alert('Kurs bulunamadı.');
                    navigate('/courses');
                }
            } catch (err) {
                console.error('Error fetching course for payment:', err);
                alert('Kurs bilgileri alınamadı.');
                navigate('/courses');
            }
        };

        fetchCourse();

    }, [courseId, navigate, user, authLoading, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock payment processing time
        setTimeout(async () => {
            try {
                // Call backend to enroll user
                const response = await api.post(`/courses/${courseId}/enroll`);
                if (response.data.status === 'success') {
                    setSuccess(true);
                    // Redirect after showing success message
                    setTimeout(() => {
                        navigate('/courses');
                    }, 3000);
                }
            } catch (err: any) {
                console.error('Enrollment API failed:', err);
                // If error is 400 (already enrolled), that's fine too?
                if (err.response?.status === 400 && err.response?.data?.message === 'Bu kursa zaten kayıtlısınız') {
                    alert('Bu kursa zaten kayıtlısınız.');
                    navigate('/courses');
                } else {
                    alert('Ödeme işlemi sırasında bir hata oluştu veya kurs bulunamadı. Lütfen tekrar deneyin.');
                }
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    if (!course) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
                    <p className="text-gray-600 mb-6">
                        <span className="font-semibold">{course.title}</span> kursuna kaydınız başarıyla tamamlandı.
                    </p>
                    <p className="text-sm text-gray-500">
                        Kurslarınıza yönlendiriliyorsunuz...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <PageWrapper>
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Güvenli Ödeme</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="md:col-span-1 order-2 md:order-1">
                        <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>
                            <div className="space-y-4">
                                <div>
                                    <img src={course.image} alt={course.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                                    <h4 className="font-medium text-gray-900 line-clamp-2">{course.title}</h4>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                    <span className="text-gray-600">Toplam</span>
                                    <span className="text-2xl font-bold text-blue-600">₺{course.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="md:col-span-2 order-1 md:order-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <div className="flex items-center mb-6">
                                <CreditCard className="text-blue-600 mr-2" size={24} />
                                <h2 className="text-xl font-bold text-gray-900">Kart Bilgileri</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ad Soyad"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            maxLength={19}
                                            className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                                        />
                                        <CreditCard className="absolute left-4 top-2.5 text-gray-400" size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                maxLength={5}
                                                className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="AA/YY"
                                                value={expiry}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                                    setExpiry(val);
                                                }}
                                            />
                                            <Calendar className="absolute left-4 top-2.5 text-gray-400" size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                maxLength={3}
                                                className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="123"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                            />
                                            <Lock className="absolute left-4 top-2.5 text-gray-400" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                                        }`}
                                >
                                    {loading ? 'İşleniyor...' : `Ödemeyi Tamamla (₺${course.price})`}
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center">
                                    <Lock size={12} className="mr-1" />
                                    Ödemeniz 256-bit SSL sertifikası ile korunmaktadır.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Payment;
