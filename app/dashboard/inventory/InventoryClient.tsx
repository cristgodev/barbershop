'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, AdjustmentsHorizontalIcon, ArrowPathIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/currency'

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    sku: string | null
    imageUrl: string | null
}

export default function InventoryClient({ shopCurrency }: { shopCurrency: string }) {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', sku: '' })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            if (data.success) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error('Failed to fetch products', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setProducts([...products, data.product])
                setIsAdding(false)
                setFormData({ name: '', description: '', price: '', stock: '', sku: '' })
            }
        } catch (error) {
            console.error('Failed to create product', error)
        }
    }

    const updateStock = async (id: string, newStock: number) => {
        if (newStock < 0) return
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock })
            })
            const data = await res.json()
            if (data.success) {
                setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p))
            }
        } catch (error) {
            console.error('Failed to update stock', error)
        }
    }

    const deleteProduct = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar el producto ${name}?`)) return
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setProducts(products.filter(p => p.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete product', error)
        }
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Inventario y Productos
                    </h1>
                    <p className="text-zinc-500 mt-2">Gestiona el catálogo de productos disponibles para la venta.</p>
                </div>
                
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-3 px-6 rounded-xl transition-all shadow-md shrink-0"
                >
                    {isAdding ? 'Cancelar' : '+ Nuevo Producto'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-6">Añadir Nuevo Producto</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Nombre del Producto</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-yellow-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">SKU (Código de Barras)</label>
                                <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-yellow-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Precio de Venta ($)</label>
                                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-yellow-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Stock Inicial</label>
                                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-yellow-600" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold">Descripción</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-yellow-600" />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md">
                                Guardar Producto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4 text-center">SKU</th>
                                <th className="px-6 py-4 text-center">Precio</th>
                                <th className="px-6 py-4 text-center">Stock Disponible</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:border-zinc-800">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold">
                                            {product.name}
                                            {product.description && <p className="text-xs text-zinc-500 font-normal mt-0.5">{product.description}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-center text-zinc-500 font-mono text-xs">{product.sku || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center font-bold font-serif text-lg text-yellow-600">{formatCurrency(product.price, shopCurrency)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1">
                                                <button onClick={() => updateStock(product.id, product.stock - 1)} className="w-8 h-8 rounded hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-lg">-</button>
                                                <span className={`w-12 text-center font-bold ${product.stock <= 5 ? 'text-red-500' : ''}`}>{product.stock}</span>
                                                <button onClick={() => updateStock(product.id, product.stock + 1)} className="w-8 h-8 rounded hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-lg">+</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteProduct(product.id, product.name)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No hay productos registrados en el inventario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
