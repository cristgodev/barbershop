'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '../../contexts/LanguageContext'

export default function ShopSettingsForm({ shop }: { shop: any }) {
    const router = useRouter()
    const { t } = useTranslation()
    
    const [name, setName] = useState(shop.name || '')
    const [description, setDescription] = useState(shop.description || '')
    const [address, setAddress] = useState(shop.address || '')
    const [phone, setPhone] = useState(shop.phone || '')
    const [instagramUrl, setInstagramUrl] = useState(shop.instagramUrl || '')
    const [tiktokUrl, setTiktokUrl] = useState(shop.tiktokUrl || '')
    const [currency, setCurrency] = useState(shop.currency || 'USD')
    
    const [heroImageUrl, setHeroImageUrl] = useState(shop.heroImageUrl || '')
    const [galleryUrls, setGalleryUrls] = useState(shop.galleryUrls || '')
    
    // Feature Flags
    const [isCrmEnabled, setIsCrmEnabled] = useState(shop.isCrmEnabled ?? true)
    const [isPosEnabled, setIsPosEnabled] = useState(shop.isPosEnabled ?? true)
    const [isGamificationEnabled, setIsGamificationEnabled] = useState(shop.isGamificationEnabled ?? true)
    const [isMarketingEnabled, setIsMarketingEnabled] = useState(shop.isMarketingEnabled ?? false)
    const [isLoyaltyEnabled, setIsLoyaltyEnabled] = useState(shop.isLoyaltyEnabled ?? false)
    
    // UI states for actual files
    const [heroFile, setHeroFile] = useState<File | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<File[]>([])
    
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const uploadFiles = async (files: File[]) => {
        const formData = new FormData()
        files.forEach(f => formData.append('file', f))
        
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        
        if (!res.ok) throw new Error('Failed to upload files')
        const data = await res.json()
        return data.files.map((f: any) => f.url) as string[]
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            let finalHeroUrl = heroImageUrl
            if (heroFile) {
                const urls = await uploadFiles([heroFile])
                finalHeroUrl = urls[0]
            }

            let finalGalleryUrls = galleryUrls
            if (galleryFiles.length > 0) {
                const urls = await uploadFiles(galleryFiles)
                finalGalleryUrls = urls.join(',')
            }

            const res = await fetch('/api/shop/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, description, address, phone, instagramUrl, tiktokUrl,
                    heroImageUrl: finalHeroUrl,
                    galleryUrls: finalGalleryUrls,
                    currency,
                    isCrmEnabled, isPosEnabled, isGamificationEnabled, isMarketingEnabled, isLoyaltyEnabled
                })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: t('settings.success') })
                if (heroFile) { setHeroImageUrl(finalHeroUrl); setHeroFile(null); }
                if (galleryFiles.length > 0) { setGalleryUrls(finalGalleryUrls); setGalleryFiles([]); }
                router.refresh()
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || t('settings.error_update') })
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('settings.error_unexpected') })
        }

        setIsLoading(false)
    }

    return (
        <div className="max-w-4xl w-full mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                <p className="text-zinc-500 mt-2">{t('settings.subtitle')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
            
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">{t('settings.basic_info')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.shop_name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.shop_description')}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder={t('settings.shop_desc_placeholder')}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.address')}</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 123 Main St, New York"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.phone')}</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            Instagram URL (Tienda)
                        </label>
                        <input
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/tu_barberia"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                            TikTok URL (Tienda)
                        </label>
                        <input
                            type="url"
                            value={tiktokUrl}
                            onChange={(e) => setTiktokUrl(e.target.value)}
                            placeholder="https://tiktok.com/@tu_barberia"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.currency') || 'Local Currency / Moneda'}</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        >
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="MXN">MXN ($) - Peso Mexicano</option>
                            <option value="COP">COP ($) - Peso Colombiano</option>
                            <option value="EUR">EUR (€) - Euro</option>
                            <option value="GBP">GBP (£) - British Pound</option>
                            <option value="ARS">ARS ($) - Peso Argentino</option>
                            <option value="CLP">CLP ($) - Peso Chileno</option>
                            <option value="PEN">PEN (S/) - Sol Peruano</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Visuals */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">{t('settings.visuals')}</h3>

                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.hero_image')}</label>
                    
                    <div className="w-full aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative">
                        {heroFile ? (
                            <img src={URL.createObjectURL(heroFile)} className="w-full h-full object-cover" />
                        ) : heroImageUrl ? (
                            <img src={heroImageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-zinc-400 font-medium">{t('settings.no_hero_image')}</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setHeroFile(e.target.files[0])
                                    }
                                }}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                title="Click to upload Hero Image"
                            />
                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium shadow-md pointer-events-none">{t('settings.change_image')}</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('settings.hero_hint')}</p>
                </div>

                <div className="space-y-3 pt-6">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.upload_gallery')}</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            if (e.target.files) {
                                setGalleryFiles(Array.from(e.target.files))
                            }
                        }}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-800 cursor-pointer"
                    />
                    
                    {(galleryFiles.length > 0 || galleryUrls) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                            {galleryFiles.length > 0 
                                ? galleryFiles.map((f, i) => <img key={i} src={URL.createObjectURL(f)} className="aspect-video rounded-lg object-cover" />)
                                : galleryUrls.split(',').filter(Boolean).map((u: string, i: number) => <img key={i} src={u} className="aspect-video rounded-lg object-cover" />)
                            }
                        </div>
                    )}
                    <p className="text-xs text-zinc-500">{t('settings.gallery_hint')}</p>
                </div>

            </div>

            {/* App Modules (Feature Flags) */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">App Modules</h3>
                <p className="text-sm text-zinc-500 pb-4">Activa o desactiva las funcionalidades opcionales de tu barbería.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <span className="block font-bold">Advanced CRM (Clientes)</span>
                            <span className="text-xs text-zinc-500">Activa notas privadas y perfiles detallados por cliente.</span>
                        </div>
                        <input type="checkbox" checked={isCrmEnabled} onChange={(e) => setIsCrmEnabled(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-black" />
                    </label>

                    <label className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <span className="block font-bold">POS & Inventario</span>
                            <span className="text-xs text-zinc-500">Punto de venta físico, caja registradora virtual y catálogo Retail.</span>
                        </div>
                        <input type="checkbox" checked={isPosEnabled} onChange={(e) => setIsPosEnabled(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-black" />
                    </label>

                    <label className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <span className="block font-bold">Gamificación de Staff</span>
                            <span className="text-xs text-zinc-500">Métricas avanzadas y metas mensuales por barbero en Contabilidad.</span>
                        </div>
                        <input type="checkbox" checked={isGamificationEnabled} onChange={(e) => setIsGamificationEnabled(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-black" />
                    </label>

                    <label className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <span className="block font-bold text-zinc-400">Marketing & No-Shows</span>
                            <span className="text-xs text-zinc-500">Penalizaciones dinámicas y Mail blasts.</span>
                        </div>
                        <input type="checkbox" checked={isMarketingEnabled} onChange={(e) => setIsMarketingEnabled(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-black" />
                    </label>

                    <label className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <span className="block font-bold text-zinc-400">Loyalty Programs</span>
                            <span className="text-xs text-zinc-500">Puntos de lealtad para clientes finales.</span>
                        </div>
                        <input type="checkbox" checked={isLoyaltyEnabled} onChange={(e) => setIsLoyaltyEnabled(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-black" />
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-lg"
                >
                    {isLoading ? t('settings.saving') : t('settings.save')}
                </button>
            </div>
        </form>
            </div>
        </div>
    )
}
