import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Users, Eye } from 'lucide-react';
import { getCsrfToken } from '../utils/csrf';
import { useAuth } from '../context/AuthContext';

// Socket connection
const socket = io('http://localhost:5000', {
    withCredentials: true,
    autoConnect: true
});

const Stats = () => {
    const [onlineUsersCount, setOnlineUsersCount] = useState(0);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        // Track visitor on mount
        const trackVisitor = async () => {
            try {
                const csrfToken = getCsrfToken();
                await fetch('/api/v1/visitors/track', {
                    method: 'POST',
                    headers: {
                        'X-XSRF-TOKEN': csrfToken
                    },
                    credentials: 'include'
                });

                // Get updated stats
                const res = await fetch(`/api/v1/visitors/stats?t=${Date.now()}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setTotalVisitors(data.data.totalVisitors);
                }
            } catch (error) {
                console.error('Error tracking visitor:', error);
            }
        };

        trackVisitor();
    }, []);

    useEffect(() => {
        // Socket listeners
        socket.on('connect', () => {
            console.log('Connected to socket server');
            if (user) {
                socket.emit('userConnected', user.id);
            }
        });

        socket.on('onlineUsers', (users) => {
            console.log('Online users updated:', users);
            setOnlineUsersCount(users.length);
        });

        // Emit when user changes (e.g. login)
        if (user) {
            socket.emit('userConnected', user.id);
        }

        return () => {
            socket.off('connect');
            socket.off('onlineUsers');
        };
    }, [user]);

    return (
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1" title="Çevrimiçi Kullanıcılar">
                <Users size={16} className="text-green-500" />
                <span className="font-medium">{onlineUsersCount}</span>
                <span className="hidden md:inline text-xs text-gray-500">Çevrimiçi</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-1" title="Toplam Ziyaretçi">
                <Eye size={16} className="text-blue-500" />
                <span className="font-medium">{totalVisitors}</span>
                <span className="hidden md:inline text-xs text-gray-500">Ziyaret</span>
            </div>
        </div>
    );
};

export default Stats;
