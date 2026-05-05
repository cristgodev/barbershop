'use client';

import { useTranslation } from "../contexts/LanguageContext";

export default function TopNavLinks() {
    const { t } = useTranslation();

    return (
        <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">{t('navigation.services')}</a>
            <a href="#products" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">Productos</a>
            <a href="#staff" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">{t('navigation.staff')}</a>
            <a href="#contacto" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">{t('navigation.contact')}</a>
        </nav>
    )
}
