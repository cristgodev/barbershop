'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '../../contexts/LanguageContext'

export default function AddStaffForm({ barbershopId }: { barbershopId: string }) {
    const router = useRouter()
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        // Client-side syntax validation with bypass for @prueba testing emails
        const emailLower = email.toLowerCase()
        const isTestingEmail = emailLower.includes('prueba')
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!isTestingEmail && !emailRegex.test(email)) {
            setError(t('staff.invalid_email_format'))
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, barbershopId })
            })

            const data = await res.json()

            if (!res.ok) {
                // If it is one of our custom validation error codes, translate it
                const errorMsg = data.error === 'invalid_email_format' || data.error === 'invalid_email_domain' || data.error === 'email_in_use'
                    ? t('staff.' + data.error)
                    : (data.error || t('staff.error_occurred'))
                throw new Error(errorMsg)
            }

            // Success
            setName('')
            setEmail('')
            setPhone('')
            setPassword('')
            router.refresh()

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">

            {error && (
                <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl text-sm border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('staff.full_name')}</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-zinc-900 text-sm transition-all"
                />
            </div>

            <div className="space-y-1.5 mt-4">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('staff.email_address')}</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="barber@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-zinc-900 text-sm transition-all"
                />
            </div>

            <div className="space-y-1.5 mt-4">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('staff.phone_number')}</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+57 300 123 4567"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-zinc-900 text-sm transition-all"
                />
            </div>

            <div className="space-y-1.5 mt-4">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('staff.temp_password')}</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-zinc-900 text-sm transition-all"
                />
                <p className="text-xs text-zinc-500 mt-1 pl-1">{t('staff.login_info')}</p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-3 rounded-xl font-semibold text-sm transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {t('staff.adding_barber')}
                    </>
                ) : t('staff.invite_barber')}
            </button>

        </form>
    )
}
