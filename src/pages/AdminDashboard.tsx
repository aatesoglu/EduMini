import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Enrolment, AdminStats } from '../types/admin';
import { Users, Eye, BookOpen, GraduationCap, Calendar, Mail } from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
  });
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrolment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.status === 'success') {
          const data = response.data.data;
          setStats({
            totalCourses: data.stats.totalCourses,
            totalStudents: data.stats.totalUsers,
            totalEnrollments: 0
          });
          setOnlineUsers(data.stats.onlineUsers);
          setTotalVisitors(data.stats.totalVisitors); // Set initial value from main stats
          setRecentEnrollments(data.recentEnrollments);
        }

        // Fetch Visitor Stats with cache busting
        const visitorRes = await fetch(`/api/v1/visitors/stats?t=${Date.now()}`);
        const visitorData = await visitorRes.json();
        if (visitorData.status === 'success') {
          setTotalVisitors(visitorData.data.totalVisitors);
        }

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Yönetim Paneli</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Anlık Online Kullanıcı */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Anlık Online</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{onlineUsers}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="text-green-600" size={24} />
          </div>
        </div>

        {/* Toplam Ziyaretçi */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Toplam Ziyaretçi</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalVisitors}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Eye className="text-blue-600" size={24} />
          </div>
        </div>

        {/* Toplam Öğrenci/Kullanıcı */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <GraduationCap className="text-purple-600" size={24} />
          </div>
        </div>

        {/* Toplam Kurs */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Toplam Kurs</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalCourses}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <BookOpen className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              Son Kayıtlar
            </h2>
            {/* <button
              onClick={() => navigate('/admin/enrollments')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Tümünü Görüntüle
            </button> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Henüz kayıt bulunmuyor</td>
                </tr>
              ) : (
                recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{enrollment.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enrollment.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BookOpen className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">Kursları Yönet</h3>
          <p className="text-sm text-gray-500 mt-2">Tüm kursları listele ve incele.</p>
        </button>

        <button
          onClick={() => navigate('/admin/users')}
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">Kullanıcıları Yönet</h3>
          <p className="text-sm text-gray-500 mt-2">Öğrenci ve eğitmen hesaplarını düzenle.</p>
        </button>

        <button
          onClick={() => navigate('/admin/announcements')}
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">Duyuruları Yönet</h3>
          <p className="text-sm text-gray-500 mt-2">Yeni duyuru ekle veya mevcutları düzenle.</p>
        </button>

        <button
          onClick={() => navigate('/admin/messages')}
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Mail className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">Mesajları Yönet</h3>
          <p className="text-sm text-gray-500 mt-2">Gelen iletişim mesajlarını oku ve yanıtla.</p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
