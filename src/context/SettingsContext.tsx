import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

interface SettingsContextType {
    settings: { [key: string]: string };
    loading: boolean;
    updateLocalSettings: (newSettings: { [key: string]: string }) => void;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: {},
    loading: true,
    updateLocalSettings: () => { },
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data && response.data.data) {
                    setSettings(response.data.data);
                }
            } catch (error) {
                console.error('Ayarlar yüklenirken hata oluştu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateLocalSettings = (newSettings: { [key: string]: string }) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateLocalSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
