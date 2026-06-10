/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import CarritoService from '../services/CarritoService';

const DEBUG = false;

function debugLog(type, data) {
    if (!DEBUG) return;
    const label = type.toUpperCase();
    const colorMap = { info: 'blue', action: 'orange', success: 'lime', error: 'red', merge: 'magenta' };
    console.log(`%c[CarritoContext] ${label}`, `color: ${colorMap[type] || 'blue'}`);
    console.log('  ', data);
}

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
    const { user, isAuthenticated } = useContext(AuthContext);

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [category, setCategory] = useState([]);
    const [selectCategory, setSelectCategory] = useState('todas');
    const [syncing, setSyncing] = useState(false);
    const [cartInitialized, setCartInitialized] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/catalogo/categorias`)
            .then(res => {
                setCategory(['todas', ...res.data]);
            }).catch(() => {
                toast.error('Error al cargar las categorías. Intenta de nuevo más tarde.');
            });
    }, []);

    useEffect(() => {
        if (cartInitialized) return;

        if (isAuthenticated()) {
            debugLog('info', { message: 'Usuario autenticado, iniciando sync', user: user?.email });
            syncLocalToServer();
        } else {
            debugLog('info', { message: 'Usuario anónimo, usando localStorage', cart: CarritoService.formatForDebug(cart) });
            setCartInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function syncLocalToServer() {
        setSyncing(true);
        const localCart = [...cart];
        debugLog('merge', {
            step: 1,
            message: 'Iniciando merge por diff',
            localCart: CarritoService.formatForDebug(localCart)
        });

        const serverResult = await CarritoService.getCarrito();
        if (!serverResult.success) {
            debugLog('error', { message: 'Error al obtener carrito del servidor', error: serverResult.message });
            setCartInitialized(true);
            setSyncing(false);
            return;
        }

        const serverCart = CarritoService.normalizeFromServer(serverResult.data);
        debugLog('merge', {
            step: 2,
            message: 'Carrito del servidor obtenido',
            serverCart: CarritoService.formatForDebug(serverCart)
        });

        const localMap = new Map(localCart.map(i => [i.id, i]));
        const serverMap = new Map(serverCart.map(i => [i.id, i]));

        const toAdd = [];
        const toRemove = [];
        const toUpdate = [];

        for (const [id, item] of localMap) {
            if (!serverMap.has(id)) {
                toAdd.push(item);
            } else {
                toUpdate.push(item);
            }
        }

        for (const [id, item] of serverMap) {
            if (!localMap.has(id)) {
                toRemove.push(item);
            }
        }

        CarritoService.debugMergeDiff({ toAdd, toRemove, toUpdate });

        const ops = [];

        if (toAdd.length > 0) {
            debugLog('merge', { step: 3, message: 'Items SOLO en local → POST', items: toAdd.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad })) });
            for (const item of toAdd) {
                ops.push(CarritoService.addItem(item.id, item.cantidad));
            }
        }

        if (toRemove.length > 0) {
            debugLog('merge', { step: 4, message: 'Items SOLO en server → DELETE', items: toRemove.map(i => ({ id: i.id, nombre: i.nombre })) });
            for (const item of toRemove) {
                ops.push(CarritoService.removeItem(item.id));
            }
        }

        if (toUpdate.length > 0) {
            debugLog('merge', { step: 5, message: 'Items en AMBOS → PUT con cantidad local', items: toUpdate.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad })) });
            for (const item of toUpdate) {
                ops.push(CarritoService.updateItem(item.id, item.cantidad));
            }
        }

        if (ops.length > 0) {
            debugLog('merge', { step: 6, message: `Ejecutando ${ops.length} operaciones en paralelo...` });
            const results = await Promise.allSettled(ops);
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                debugLog('error', { message: `${failed.length} operaciones fallaron`, failed });
            }
        } else {
            debugLog('merge', { step: 6, message: 'No hay diferencias, merge no requiere cambios' });
        }

        const finalResult = await CarritoService.getCarrito();
        if (finalResult.success) {
            const normalized = CarritoService.normalizeFromServer(finalResult.data);
            debugLog('merge', {
                step: 7,
                message: 'Sync completado',
                finalCart: CarritoService.formatForDebug(normalized)
            });
            setCart(normalized);
            localStorage.setItem('cart', JSON.stringify(normalized));
        } else {
            debugLog('error', { message: 'Error al obtener carrito final', error: finalResult.message });
        }

        setCartInitialized(true);
        setSyncing(false);
    }

    const agregarAlCarrito = useCallback(async (producto, cantidad = 1) => {
        debugLog('action', { type: 'AGREGAR', producto: producto.nombre, cantidad });

        if (isAuthenticated()) {
            const result = await CarritoService.addItem(producto.id, cantidad);
            if (result.success) {
                const normalized = CarritoService.normalizeFromServer(result.data);
                debugLog('success', { message: 'Agregado vía API', newCart: CarritoService.formatForDebug(normalized) });
                setCart(normalized);
            } else {
                debugLog('error', { message: 'Error al agregar vía API', error: result.message });
                toast.error(result.message);
            }
        } else {
            setCart(prev => {
                const existe = prev.find(p => p.id === producto.id);
                if (existe) {
                    return prev.map(c =>
                        c.id === producto.id ? { ...c, cantidad: c.cantidad + cantidad } : c
                    );
                }
                return [...prev, { ...producto, cantidad }];
            });
            debugLog('success', { message: 'Agregado a localStorage' });
        }
    }, [isAuthenticated]);

    const eliminarDelCarrito = useCallback(async (id) => {
        // Find item name for debug
        const item = cart.find(c => c.id === id);
        debugLog('action', { type: 'ELIMINAR', id, nombre: item?.nombre });

        if (isAuthenticated()) {
            const result = await CarritoService.removeItem(id);
            if (result.success) {
                const serverResult = await CarritoService.getCarrito();
                if (serverResult.success) {
                    const normalized = CarritoService.normalizeFromServer(serverResult.data);
                    debugLog('success', { message: 'Eliminado vía API', newCart: CarritoService.formatForDebug(normalized) });
                    setCart(normalized);
                }
            } else {
                debugLog('error', { message: 'Error al eliminar vía API', error: result.message });
                toast.error(result.message);
            }
        } else {
            setCart(prev => prev.filter(c => c.id !== id));
            debugLog('success', { message: 'Eliminado de localStorage' });
        }
    }, [isAuthenticated, cart]);

    const actualizarCantidad = useCallback(async (id, nuevaCantidad) => {
        const item = cart.find(c => c.id === id);
        debugLog('action', { type: 'ACTUALIZAR_CANTIDAD', id, nombre: item?.nombre, nuevaCantidad });

        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }

        if (isAuthenticated()) {
            const result = await CarritoService.updateItem(id, nuevaCantidad);
            if (result.success) {
                const normalized = CarritoService.normalizeFromServer(result.data);
                debugLog('success', { message: 'Cantidad actualizada vía API', newCart: CarritoService.formatForDebug(normalized) });
                setCart(normalized);
            } else {
                debugLog('error', { message: 'Error al actualizar cantidad vía API', error: result.message });
                toast.error(result.message);
            }
        } else {
            setCart(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, cantidad: nuevaCantidad } : c
                )
            );
            debugLog('success', { message: 'Cantidad actualizada en localStorage' });
        }
    }, [isAuthenticated, cart, eliminarDelCarrito]);

    const vaciarCarrito = useCallback(async () => {
        debugLog('action', { type: 'VACIAR' });

        if (isAuthenticated()) {
            const result = await CarritoService.clearCarrito();
            if (!result.success) {
                if (result.message?.toLowerCase().includes('no tienes un carrito activo')) {
                    debugLog('info', { message: 'Carrito ya eliminado en backend (post-checkout)' });
                } else {
                    debugLog('error', { message: 'Error al vaciar vía API', error: result.message });
                }
            }
        }

        setCart([]);
        localStorage.removeItem('cart');
        debugLog('success', { message: 'Carrito vaciado completamente' });
    }, [isAuthenticated]);

    const calcularTotal = useCallback(() => {
        return cart.reduce((sum, i) => {
            const precio = i.enOferta && i.precioOferta ? i.precioOferta : i.precioBase;
            return sum + precio * i.cantidad;
        }, 0);
    }, [cart]);

    return (
        <CarritoContext.Provider value={{
            cart,
            syncing,
            agregarAlCarrito,
            eliminarDelCarrito,
            actualizarCantidad,
            vaciarCarrito,
            calcularTotal,
            category,
            selectCategory,
            setSelectCategory,
        }}>
            {children}
        </CarritoContext.Provider>
    );
}
