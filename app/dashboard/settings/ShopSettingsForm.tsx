'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ShopSettingsForm({ shop }: { shop: any }) {
    const router = useRouter()
    
    const [name, setName] = useState(shop.name || '')
    const [description, setDescription] = useState(shop.description || '')
    const [address, setAddress] = useState(shop.address || '')
    const [phone, setPhone] = useState(shop.phone || '')
    
    const [heroImageUrl, setHeroImageUrl] = useState(shop.heroImageUrl || '')
    const [galleryUrls, setGalleryUrls] = useState(shop.galleryUrls || '')
    
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
                    name, description, address, phone,
                    heroImageUrl: finalHeroUrl,
                    galleryUrls: finalGalleryUrls
                })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Shop settings updated successfully!' })
                if (heroFile) { setHeroImageUrl(finalHeroUrl); setHeroFile(null); }
                if (galleryFiles.length > 0) { setGalleryUrls(finalGalleryUrls); setGalleryFiles([]); }
                router.refresh()
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to update settings.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred during upload.' })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Shop Name</label>
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
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Shop Description (Shown on Landing Page)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="e.g. Experience traditional barbering combined with modern styling techniques."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Address (Optional)</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 123 Main St, New York"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Phone Number (Optional)</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                        />
                    </div>
                </div>
            </div>

            {/* Visuals */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">Landing Page Visuals</h3>

                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Main Hero Barbershop Image</label>
                    
                    <div className="w-full aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative">
                        {heroFile ? (
                            <img src={URL.createObjectURL(heroFile)} className="w-full h-full object-cover" />
                        ) : heroImageUrl ? (
                            <img src={heroImageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-zinc-400 font-medium">No Hero Image Selected</div>
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
                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium shadow-md pointer-events-none">Change Image</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">Pick a wide, high-quality image of the interior of your shop. It will be the first thing customers see.</p>
                </div>

                <div className="space-y-3 pt-6">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload Shop Gallery (Interior, tools, products)</label>
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
                    <p className="text-xs text-zinc-500">Upload multiple photos of your shop. Selecting new photos overwrites the existing gallery.</p>
                </div>

            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-lg"
                >
                    {isLoading ? 'Saving Changes to Shop...' : 'Save Barbershop Settings'}
                </button>
            </div>
        </form>
    )
}
