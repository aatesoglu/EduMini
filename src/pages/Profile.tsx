import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, User as UserIcon, Camera, Lock } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '../utils/api';

interface Course {
    id: number;
    title: string;
    description: string;
    image: string;
    coverImage: string;
    instructor: {
        username: string;
    };
    progress?: number;
}

const Profile = () => {
    const { user, token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setEditForm({
                username: user.username,
                email: user.email,
                password: '',
                confirmPassword: ''
            });
            // Construct full image URL if profileImage exists
            if (user.profileImage) {
                setPreviewUrl(user.profileImage.startsWith('http')
                    ? user.profileImage
                    : `http://localhost:5000/img/${user.profileImage}`);
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await api.get('/users/me/courses');
                const data = response.data as any;

                if (data.status === 'success') {
                    // Add mock progress for demo purposes
                    const coursesWithProgress = (data.data.courses || []).map((course: any) => ({
                        ...course,
                        progress: Math.floor(Math.random() * 100),
                        // Ensure instructor data is preserved
                        instructor: course.instructor || null
                    }));
                    setEnrolledCourses(coursesWithProgress);
                } else {
                    setError('Kurs bilgileri alınamadı.');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Kurs bilgileri yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchEnrolledCourses();
        }
    }, [user, token]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Oturum Açmanız Gerekiyor</h2>
                    <p className="text-gray-600 mb-6">Profilinizi görüntülemek için lütfen giriş yapın.</p>
                    <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editForm.password && editForm.password !== editForm.confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('username', editForm.username);
            formData.append('email', editForm.email);

            if (editForm.password) {
                formData.append('password', editForm.password);
            }

            if (selectedFile) {
                formData.append('profileImage', selectedFile);
            }

            // Include CSRF token for multipart/form-data requests
            const csrfToken = Cookies.get('XSRF-TOKEN');
            if (csrfToken) {
                formData.append('_csrf', csrfToken);
            }

            const response = await api.put(`/users/${user?.id}`, formData);

            if (response.data) {
                // Update local storage and context
                // api interceptor returns response.data automatically? No, api returns response.
                const updatedUser = (response.data as any).data?.user || (response.data as any).user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                alert('Profil başarıyla güncellendi!');
                window.location.reload();
            }
        } catch (err: any) {
            console.error('Update error:', err);
            alert(`Profil güncellenirken hata oluştu: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const activeCourses = enrolledCourses.filter(c => (c.progress || 0) < 100);
    const completedCourses = enrolledCourses.filter(c => (c.progress || 0) === 100);

    // ... check user ...

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Welcome Section */}
            <div className="bg-blue-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm overflow-hidden relative w-20 h-20 flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000/img/${user.profileImage}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon size={48} className="text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Hoş Geldin, {user.username}!</h1>
                                <p className="mt-2 text-blue-100">Öğrenme yolculuğuna kaldığın yerden devam et.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {isEditing ? 'Düzenlemeyi İptal Et' : 'Profili Düzenle'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Kayıtlı Kurslar</p>
                            <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Toplam Çalışma</p>
                            <p className="text-2xl font-bold text-gray-900">12 Saat</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tamamlanan</p>
                            <p className="text-2xl font-bold text-gray-900">{completedCourses.length} Kurs</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course List (Left 2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <BookOpen className="mr-2 text-blue-600" size={20} />
                                    Kurslarım
                                </h2>
                                <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'active'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Devam Eden ({activeCourses.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Tamamlanan ({completedCourses.length})
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                                    {error}
                                </div>
                            ) : (activeTab === 'active' ? activeCourses : completedCourses).length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                                    <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                                        <BookOpen size={32} className="text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {activeTab === 'active' ? 'Devam eden kursunuz yok' : 'Henüz tamamlanan kursunuz yok'}
                                    </h3>
                                    <p className="text-gray-500 mb-6">Yeni yetenekler kazanmak için kurs kataloğumuza göz atın.</p>
                                    <Link to="/courses" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                        Kursları İncele
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(activeTab === 'active' ? activeCourses : completedCourses).map((course) => (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row">
                                            <div className="sm:w-48 h-48 sm:h-auto relative">
                                                <img
                                                    src={
                                                        course.image
                                                            ? (course.image.startsWith('http') 
                                                                ? course.image 
                                                                : course.image.startsWith('/')
                                                                ? `http://localhost:5000${course.image}`
                                                                : `http://localhost:5000/img/${course.image}`)
                                                            : 'https://via.placeholder.com/300x200?text=Course'
                                                    }
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                                            <Link to={`/courses/${course.id}`} className="hover:text-blue-600 transition-colors">
                                                                {course.title}
                                                            </Link>
                                                        </h3>
                                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${course.progress === 100
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {course.progress === 100 ? 'Tamamlandı' : 'Devam Ediyor'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                                    {/* Progress Bar */}
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>İlerleme</span>
                                                            <span>{course.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                                                    }`}
                                                                style={{ width: `${course.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <UserIcon size={16} className="mr-1" />
                                                        Eğitmen: {course.instructor?.username || course.instructor?.email?.split('@')[0] || 'Eğitmen'}
                                                    </div>
                                                    <Link
                                                        to={`/courses/${course.id}`}
                                                        className={`text-sm font-medium flex items-center ${course.progress === 100
                                                            ? 'text-green-600 hover:text-green-500'
                                                            : 'text-blue-600 hover:text-blue-500'
                                                            }`}
                                                    >
                                                        {course.progress === 100 ? 'Sertifikayı Görüntüle' : 'Derse Devam Et'} &rarr;
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Right 1/3) */}
                    <div className="space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Profil Bilgileri</h3>
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 overflow-hidden relative group">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Profil" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <UserIcon size={40} />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-medium">
                                                <Camera size={18} />
                                                <span>Fotoğrafı değiştir</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                        <span className="text-xs text-gray-500">PNG/JPG, maks 5MB</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Lock size={16} /> Şifre Değiştir
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre (İsteğe bağlı)</label>
                                                <input
                                                    type="password"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                                <input
                                                    type="password"
                                                    value={editForm.confirmPassword}
                                                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="Şifreyi onaylayın"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                            Kaydet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">E-posta</label>
                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</label>
                                        <p className="text-gray-900 font-medium capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Üyelik Tarihi</label>
                                        <p className="text-gray-900 font-medium">01 Ocak 2024</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full mt-4 bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200"
                                    >
                                        Profili Düzenle
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recommendations (Mock) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Önerilen Kurslar</h3>
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex space-x-3">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">İleri Seviye React Geliştirme</h4>
                                            <p className="text-xs text-gray-500 mt-1">4.8 (120)</p>
                                        </div>
                                    </div>
                                ))}
                                <Link to="/courses" className="block text-center text-sm text-blue-600 hover:underline mt-4">
                                    Tümünü Gör
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
