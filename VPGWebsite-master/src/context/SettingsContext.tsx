'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    contactAdmin: string;
    settings: any[];
    getSetting: (key: string) => string;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
    contactAdmin: '',
    settings: [],
    getSetting: () => '',
    isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [contactAdmin, setContactAdmin] = useState('');
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSettings(data);
                    const contact = data.find((s: any) => s.key === 'CONTACT_ADMIN');
                    if (contact && contact.value) {
                        setContactAdmin(contact.value);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const getSetting = (key: string) => {
        const setting = settings.find((s) => s.key === key);
        return setting?.value || '';
    };

    return (
        <SettingsContext.Provider value={{ contactAdmin, settings, getSetting, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};
