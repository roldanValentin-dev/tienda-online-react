import { createContext ,useState,useEffect} from "react";
import API_BASE_URL from "../config/api";

export const CarritoContext = createContext();

export function CarritoProvider({children}) {
    //inicializamos el estado del carrito y los productos
    const [products,setProducts] = useState([]);
    const [loading,setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    useEffect(() =>{
        fetch(`${API_BASE_URL}/api/catalogo/productos`)
        .then(res => res.json())
        .then(data => {
            setProducts(data);
            console.log(data);
            setLoading(false);
        }).catch(error => {
            console.error('Error al cargar productos:', error);
            setLoading(false);
        });
    },[]);
        
    // funciones para agregar, eliminar y calcular total
    const agregarAlCarrito = (producto) =>{
        const existe = cart.find(p => p.id === producto.id);
        if (existe) {
            setCart(cart.map(c => c.id === producto.id ?  {...c, cantidad: c.cantidad + 1} : c));
        }else{
            setCart([...cart, {...producto, cantidad: 1}]);
        }
    };
    const eliminarDelCarrito= (id) => {
        setCart(cart.filter(c => c.id !== id));
    } 
    const calcularTotal = () => {
        //multiplica el precio por la cantidad y lo acumula
        return cart.reduce((sum, i) => sum + i.precioBase* i.cantidad, 0);
    }
    return (
        <CarritoContext.Provider value ={{ products,cart,loading,agregarAlCarrito,eliminarDelCarrito,calcularTotal}}>
            {children}
        </CarritoContext.Provider>
    );
}
