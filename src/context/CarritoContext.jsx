import { createContext, useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
    // Inicializar carrito desde localStorage si existe
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [category, setCategory] = useState([]);
    const [selectCategory, setSelectCategory] = useState('todas');

    // Persistir carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    //fetch categorias
    useEffect(() => {
        // Delay artificial de 2 segundos para ver el skeleton
        setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/catalogo/categorias`)
            .then(res => {
                setCategory(['todas', ...res.data]);
            }).catch(err => {
                console.error(`Error al cargar Categorias ${err}`);
            });
        }, 2000);
    }, []);

    /**
     * Agrega un producto al carrito
     * @param {Object} producto - Producto a agregar
     * @param {number} cantidad - Cantidad a agregar (por defecto 1)
     */
    const agregarAlCarrito = (producto, cantidad = 1) => {
        const existe = cart.find(p => p.id === producto.id);
        if (existe) {
            setCart(cart.map(c => c.id === producto.id ? { ...c, cantidad: c.cantidad + cantidad } : c));
        } else {
            setCart([...cart, { ...producto, cantidad: cantidad }]);
        }
    };
    /**
     * Elimina un producto del carrito
     * @param {number} id - ID del producto a eliminar
     */
    const eliminarDelCarrito = (id) => {
        setCart(cart.filter(c => c.id !== id));
    }
    
    /**
     * Vaciar todo el carrito (usado después de confirmar pedido)
     */
    const vaciarCarrito = () => {
        setCart([]);
        localStorage.removeItem('cart');
    }
    
    /**
     * Calcula el total del carrito
     * @returns {number} Total del carrito
     */
    const calcularTotal = () => {
        return cart.reduce((sum, i) => sum + i.precioBase * i.cantidad, 0);
    }
    return (
        <CarritoContext.Provider value={{
            cart,
            agregarAlCarrito,
            eliminarDelCarrito,
            vaciarCarrito,
            calcularTotal,
            category,
            selectCategory,
            setSelectCategory
        }}>
            {children}
        </CarritoContext.Provider>
    );
}
