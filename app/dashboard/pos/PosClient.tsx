'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClockIcon, UserIcon, CheckCircleIcon, ShoppingBagIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/currency'
import PageTour from '../PageTour'

type Product = { id: string, name: string, price: number, stock: number, imageUrl: string | null }
type Client = { id: string, name: string, email: string | null }
type CartItem = Product & { quantity: number }

export default function PosClient({ barbershopId, shopCurrency }: { barbershopId: string, shopCurrency: string }) {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [clients, setClients] = useState<Client[]>([])
    
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState('CASH')
    
    const [isProcessing, setIsProcessing] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [prodRes, cliRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/clients')
            ])
            const prodData = await prodRes.json()
            const cliData = await cliRes.json()
            if (prodData.success) setProducts(prodData.products)
            if (cliData.success) setClients(cliData.clients)
        } catch (error) {
            console.error(error)
        }
    }

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            if (existing.quantity >= product.stock) return alert('Stock insuficiente en inventario.')
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
            if (product.stock < 1) return alert('El producto está agotado.')
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta
                if (newQ > item.stock || newQ < 1) return item
                return { ...item, quantity: newQ }
            }
            return item
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleCheckout = async () => {
        if (cart.length === 0) return
        setIsProcessing(true)
        try {
            const items = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                priceAtSale: item.price
            }))

            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedClient || null,
                    items,
                    paymentMethod
                })
            })
            const data = await res.json()
            if (data.success) {
                setSuccessMsg('¡Venta registrada exitosamente!')
                setCart([])
                setSelectedClient('')
                setTimeout(() => setSuccessMsg(''), 3000)
                // Refetch stock
                fetchData()
            } else {
                alert(data.error || 'Error procesando venta')
            }
        } catch (error) {
            alert('Error al conectar con el servidor')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 relative">
            <PageTour 
                pageKey="pos" 
                steps={[
                    {
                        element: '#tour-pos-catalog',
                        popover: { title: 'Tu Inventario Físico', description: 'Aquí aparecerán las ceras, geles o bebidas que hayas registrado. Al hacer clic, se añadirán al carrito y se descontarán del stock al cobrar.', side: 'right', align: 'start' }
                    },
                    {
                        element: '#tour-pos-cart',
                        popover: { title: 'Ticket de Venta', description: 'Puedes vincular la venta a un cliente existente (para su historial y CRM), ajustar las cantidades y marcar si el pago fue con Efectivo o Tarjeta.', side: 'left', align: 'start' }
                    }
                ]} 
            />

            <h1 className="text-3xl font-bold font-serif tracking-tight mb-8" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                Punto de Venta (POS)
            </h1>

            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold rounded-xl border border-green-200 dark:border-green-800">
                    {successMsg}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Controles y Catálogo (Izquierda) */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Buscador de productos o scanner */}
                    <div id="tour-pos-catalog" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Catálogo Rápido</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock < 1}
                                    className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${product.stock < 1 ? 'border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed' : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:shadow-md'}`}
                                >
                                    <span className="font-bold text-sm block mb-1 truncate w-full">{product.name}</span>
                                    <span className="text-yellow-600 font-serif font-bold text-lg clock">{formatCurrency(product.price, shopCurrency)}</span>
                                    <span className={`text-[10px] mt-2 font-bold px-2 py-0.5 rounded-full ${product.stock > 5 ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
                                        Stock: {product.stock}
                                    </span>
                                </button>
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-full py-8 text-center text-zinc-500">
                                    No hay productos en inventario.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ticket y Checkout (Derecha) */}
                <div id="tour-pos-cart" className="w-full lg:w-96 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden h-fit">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <h2 className="text-xl font-bold font-serif mb-4 text-center">Ticket de Venta</h2>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vincular Cliente (Opcional)</label>
                            <select 
                                value={selectedClient} 
                                onChange={e => setSelectedClient(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:ring-0 focus:border-yellow-600 font-semibold"
                            >
                                <option value="">-- Cliente de paso --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 p-6 min-h-[300px] max-h-[400px] overflow-y-auto w-full">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <p className="text-sm font-semibold">El carrito está vacío</p>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {cart.map(item => (
                                    <li key={item.id} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="font-bold text-sm truncate pr-2 w-3/5">{item.name}</div>
                                            <div className="text-sm font-bold w-2/5 text-right">{formatCurrency(item.price * item.quantity, shopCurrency)}</div>
                                        </div>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-white dark:hover:bg-zinc-800">-</button>
                                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-white dark:hover:bg-zinc-800">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs font-semibold hover:underline">Quitar</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="p-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-zinc-500">Total</span>
                            <span className="text-3xl font-bold font-serif text-black dark:text-white">{formatCurrency(total, shopCurrency)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <button 
                                onClick={() => setPaymentMethod('CASH')}
                                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${paymentMethod === 'CASH' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                            >
                                Efectivo
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('CARD')}
                                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${paymentMethod === 'CARD' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                            >
                                Tarjeta (Terminal)
                            </button>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                        >
                            {isProcessing ? 'Procesando...' : 'Completar Venta'} 
                            {!isProcessing && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
