import { createContext, useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
    //inicializamos el estado del carrito y los productos
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectCategory, setSelectCategory] = useState('todas');

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

    // funciones para agregar, eliminar y calcular total
    const agregarAlCarrito = (producto) => {
        const existe = cart.find(p => p.id === producto.id);
        if (existe) {
            setCart(cart.map(c => c.id === producto.id ? { ...c, cantidad: c.cantidad + 1 } : c));
        } else {
            setCart([...cart, { ...producto, cantidad: 1 }]);
        }
    };
    const eliminarDelCarrito = (id) => {
        setCart(cart.filter(c => c.id !== id));
    }
    const calcularTotal = () => {
        //multiplica el precio por la cantidad y lo acumula
        return cart.reduce((sum, i) => sum + i.precioBase * i.cantidad, 0);
    }
    return (
        <CarritoContext.Provider value={{
            cart,
            agregarAlCarrito,
            eliminarDelCarrito,
            calcularTotal,
            category,
            selectCategory,
            setSelectCategory
        }}>
            {children}
        </CarritoContext.Provider>
    );
}
