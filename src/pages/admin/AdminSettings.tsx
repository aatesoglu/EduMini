import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import api from '../../utils/api';
import PageWrapper from '../../components/PageWrapper';
import { Save, Mail, Phone, MapPin } from 'lucide-react';

const AdminSettings = () => {
    const { settings, updateLocalSettings } = useSettings();
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Context'ten gelen verileri state'e yaz
    useEffect(() => {
        setFormData({
            email: settings['contact_email'] || '',
            phone: settings['contact_phone'] || '',
            address: settings['contact_address'] || ''
        });
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // API'ye gönderilecek veri: key-value çiftleri
            const payload = {
                contact_email: formData.email,
                contact_phone: formData.phone,
                contact_address: formData.address
            };

            await api.post('/settings', payload);

            // Context'i güncelle
            updateLocalSettings(payload);

            setMessage({ type: 'success', text: 'Ayarlar başarıyla güncellendi!' });
        } catch (error) {
            console.error('Settings update error:', error);
            setMessage({ type: 'error', text: 'Ayarlar güncellenirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Ayarları</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <span className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </span>
                        İletişim Bilgileri
                    </h2>

                    {message && (
                        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="ornek@edumini.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="+90 555 123 4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Şirket adresi..."
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AdminSettings;
