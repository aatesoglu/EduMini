import React, { useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

const UserManager = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        console.log('Kullanıcılar getiriliyor...');
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/admin/users');
            if (response.data && response.data.status === 'success') {
                setUsers(response.data.data.users);
            }
        } catch (error: any) {
            console.error('Kullanıcılar getirilirken hata:', error);
            setError(error.response?.data?.message || 'Kullanıcılar getirilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    // Bileşen yüklendiğinde verileri çek
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

        try {
            await api.delete(`/admin/users/${id}`);
            // Kullanıcı listesini güncelle
            fetchUsers();
            alert('Kullanıcı başarıyla silindi');
        } catch (error: any) {
            console.error('Kullanıcı silinirken hata:', error);
            alert('Kullanıcı silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRoleChange = async (id: number, newRole: string) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role: newRole });

            // Yerel state'i güncelle
            setUsers(users.map(user =>
                user.id === id ? { ...user, role: newRole } : user
            ));
        } catch (error: any) {
            console.error('Rol güncellenirken hata:', error);
            alert('Rol güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-4">Kullanıcılar yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Hata!</p>
                <p>{error}</p>
                <button
                    onClick={() => fetchUsers()}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={e =>
                                            handleRoleChange(user.id, e.target.value)
                                        }
                                        className="border rounded p-1"
                                    >
                                        <option value="student">Öğrenci</option>
                                        <option value="instructor">Eğitmen</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;
