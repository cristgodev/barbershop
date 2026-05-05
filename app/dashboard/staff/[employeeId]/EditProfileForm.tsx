'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProfileForm({ user }: { user: any }) {
    const router = useRouter()
    
    const [bio, setBio] = useState(user.bio || '')
    const [instagramUrl, setInstagramUrl] = useState(user.instagramUrl || '')
    const [tiktokUrl, setTiktokUrl] = useState(user.tiktokUrl || '')
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
    const [portfolioUrls, setPortfolioUrls] = useState(user.portfolioUrls || '')
    const [showOnLanding, setShowOnLanding] = useState(user.showOnLanding ?? true)
    
    // UI states for actual files
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
    
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
            let finalAvatarUrl = avatarUrl
            if (avatarFile) {
                const urls = await uploadFiles([avatarFile])
                finalAvatarUrl = urls[0]
            }

            let finalPortfolioUrls = portfolioUrls
            if (portfolioFiles.length > 0) {
                const urls = await uploadFiles(portfolioFiles)
                // We overwrite the existing portfolio
                finalPortfolioUrls = urls.join(',')
            }

            const res = await fetch('/api/staff/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    bio,
                    instagramUrl,
                    tiktokUrl,
                    avatarUrl: finalAvatarUrl,
                    portfolioUrls: finalPortfolioUrls,
                    showOnLanding
                })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated & images uploaded successfully!' })
                if (avatarFile) { setAvatarUrl(finalAvatarUrl); setAvatarFile(null); }
                if (portfolioFiles.length > 0) { setPortfolioUrls(finalPortfolioUrls); setPortfolioFiles([]); }
                router.refresh()
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to update profile.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred during upload.' })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Avatar Image</label>
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                        {avatarFile ? (
                            <img src={URL.createObjectURL(avatarFile)} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                            <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setAvatarFile(e.target.files[0])
                            }
                        }}
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 cursor-pointer"
                    />
                </div>
                <p className="text-xs text-zinc-500">Pick an image from your device. It will be uploaded automatically.</p>
            </div>

            <div className="space-y-3 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="pr-4">
                        <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">Visibilidad Pública</label>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Si esto está apagado, el perfil de este miembro de equipo no aparecerá en la página web pública de la barbería. Útil para recepcionistas o perfiles temporalmente inactivos.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" checked={showOnLanding} onChange={(e) => setShowOnLanding(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Professional Biography</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell your clients about your experience and specialties..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow resize-none"
                    maxLength={500}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        Instagram URL
                    </label>
                    <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/tu_usuario"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                        TikTok URL
                    </label>
                    <input
                        type="url"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="https://tiktok.com/@tu_usuario"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload Portfolio Images</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        if (e.target.files) {
                            setPortfolioFiles(Array.from(e.target.files))
                        }
                    }}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-800 cursor-pointer"
                />
                
                {(portfolioFiles.length > 0 || portfolioUrls) && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                        {portfolioFiles.length > 0 
                            ? portfolioFiles.map((f, i) => <img key={i} src={URL.createObjectURL(f)} className="aspect-square rounded-lg object-cover" />)
                            : portfolioUrls.split(',').filter(Boolean).map((u: string, i: number) => <img key={i} src={u} className="aspect-square rounded-lg object-cover" />)
                        }
                    </div>
                )}
                <p className="text-xs text-zinc-500">Choosing new photos will override the existing portfolio.</p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-3.5 px-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {isLoading ? 'Uploading Files & Saving...' : 'Save Profile Settings'}
                </button>
            </div>
        </form>
    )
}
