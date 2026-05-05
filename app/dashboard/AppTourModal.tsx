'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface AppTourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AppTourModal({ isOpen, onClose }: AppTourModalProps) {
    useEffect(() => {

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: '¡Comenzar!',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            progressText: 'Paso {{current}} de {{total}}',
            onDestroyed: () => {
                onClose();
            },
            steps: [
                {
                    popover: {
                        title: '¡Bienvenido a tu Imperio! 👑',
                        description: 'Vamos a dar un recorrido rápido por las herramientas clave que llevarán tu barbería al siguiente nivel.'
                    }
                },
                {
                    element: '#tour-nav-schedule',
                    popover: {
                        title: 'Agenda Mágica Inteligente',
                        description: 'Adiós a los bloqueos manuales. Nuestro sistema previene choques automáticamente cruzando la duración de tus servicios con tus reservas.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-nav-pos',
                    popover: {
                        title: 'Punto de Venta e Inventario',
                        description: 'Vende ceras o lociones a tus clientes y súmalos directo al ticket de su corte. El inventario se descuenta solo automáticamente.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-nav-clients',
                    popover: {
                        title: 'CRM y Retención Real',
                        description: 'Añade Notas Privadas ("Fórmula de tinte #5") y marca "No-Show" (inasistencias furtivas) para proteger el tiempo de todos tus barberos.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-nav-staff',
                    popover: {
                        title: 'Gestiona tu Equipo',
                        description: 'Invita barberos, configúrales horarios estrictos, y ponles una Meta de Ventas mensual en efectivo para ver su barra de progreso en vivo.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-nav-settings',
                    popover: {
                        title: 'Configuraciones de Negocio',
                        description: 'Sube las fotos de tu portafolio, ajusta tu moneda local, y apaga/prende herramientas enteras como el POS o CRM a tu gusto.',
                        side: 'right',
                        align: 'start'
                    }
                }
            ]
        });

        if (isOpen) {
            const t = setTimeout(() => {
                driverObj.drive();
            }, 150);

            return () => {
                clearTimeout(t);
                try { driverObj.destroy(); } catch(e){}
            };
        }
        
    }, [isOpen, onClose]);

    return null;
}
