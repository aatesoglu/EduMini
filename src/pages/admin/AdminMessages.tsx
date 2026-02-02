import { useState, useEffect } from 'react';
import { Trash2, Mail, Calendar, User, MessageSquare, Send, X } from 'lucide-react';
import api from '../../utils/api';

interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    reply?: string;
    isRead: boolean;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/messages');
            if (response.data.status === 'success') {
                setMessages(response.data.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        try {
            await api.delete(`/messages/${id}`);
            setMessages(messages.filter(msg => msg.id !== id));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Mesaj silinirken bir hata oluştu.');
        }
    };

    const openReplyModal = (message: Message) => {
        setSelectedMessage(message);
        setReplyText(message.reply || '');
        setReplyModalOpen(true);
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;

        setSendingReply(true);
        try {
            const response = await api.post(`/messages/${selectedMessage.id}/reply`, {
                reply: replyText
            });

            if (response.data.status === 'success') {
                // Update message in list
                setMessages(messages.map(msg =>
                    msg.id === selectedMessage.id
                        ? { ...msg, reply: replyText, isRead: true }
                        : msg
                ));
                setReplyModalOpen(false);
                setReplyText('');
                setSelectedMessage(null);
                alert('Cevap başarıyla gönderildi/kaydedildi.');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Cevap gönderilirken bir hata oluştu.');
        } finally {
            setSendingReply(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
                <Mail className="mr-3" size={32} />
                Gelen Mesajlar
            </h1>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Mesajlar yükleniyor...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                        <Mail size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Henüz mesaj yok</h3>
                    <p className="mt-1 text-gray-500">İletişim formundan gönderilen mesajlar burada listelenecek.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${msg.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${msg.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                        <User size={20} className={msg.isRead ? 'text-gray-600' : 'text-blue-600'} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                                        <p className="text-sm text-gray-500">{msg.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 flex items-center mr-2">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(msg.createdAt).toLocaleDateString('tr-TR')}
                                    </span>

                                    <button
                                        onClick={() => openReplyModal(msg)}
                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                        title="Cevapla"
                                    >
                                        <MessageSquare size={18} />
                                        <span className="text-sm font-medium">Cevapla</span>
                                    </button>

                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">{msg.subject}</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                            </div>

                            {msg.reply && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                        <MessageSquare size={16} className="text-blue-600" />
                                        Verilen Cevap:
                                    </div>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{msg.reply}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Modal */}
            {replyModalOpen && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800">Mesaja Cevap Ver</h3>
                            <button
                                onClick={() => setReplyModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm">
                                <p className="font-semibold text-gray-700 mb-1">Kime:</p>
                                <p className="text-gray-600">{selectedMessage.name} ({selectedMessage.email})</p>
                                <p className="font-semibold text-gray-700 mt-3 mb-1">Konu:</p>
                                <p className="text-gray-600">{selectedMessage.subject}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cevabınız
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Mesajınızı buraya yazın..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setReplyModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    disabled={sendingReply || !replyText.trim()}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 ${sendingReply ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {sendingReply ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Gönder
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
