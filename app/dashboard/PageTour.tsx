'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function PageTour({ pageKey, steps }: { pageKey: string, steps: any[] }) {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(`tour_seen_${pageKey}`);
        if (!hasSeen) {
            setShouldShow(true);
        }
    }, [pageKey]);

    useEffect(() => {
        if (!shouldShow || !steps || steps.length === 0) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: '¡Entendido!',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            progressText: '{{current}} de {{total}}',
            onDestroyed: () => {
                localStorage.setItem(`tour_seen_${pageKey}`, 'true');
                setShouldShow(false);
            },
            steps: steps
        });

        // Delay starting the tour slightly to allow the DOM to fully paint
        const t = setTimeout(() => {
            try {
                driverObj.drive();
            } catch (e) {
                console.warn('Driver.js failed to start:', e);
            }
        }, 800);

        return () => {
            clearTimeout(t);
            try { driverObj.destroy(); } catch(e){}
        };
    }, [shouldShow, steps, pageKey]);

    return null;
}
