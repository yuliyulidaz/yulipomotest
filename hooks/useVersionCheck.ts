
import { useState, useCallback } from 'react';
import { LATEST_VERSION } from '../components/ReleaseNotesModal';

export const useVersionCheck = () => {
    const [hasUpdate, setHasUpdate] = useState(false);

    const checkVersion = useCallback(async () => {
        try {
            const response = await fetch('/version.json', { cache: 'no-store' });
            if (!response.ok) return;

            const data = await response.json();
            if (data.version && data.version !== LATEST_VERSION) {
                setHasUpdate(true);
            }
        } catch (error) {
            console.error("Failed to check version:", error);
        }
    }, []);

    return { hasUpdate, checkVersion };
};
