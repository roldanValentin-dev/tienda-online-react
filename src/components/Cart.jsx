import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";

function Cart() {
    const { cart, eliminarDelCarrito, calcularTotal } = useContext(CarritoContext);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Shopping Cart</h1>
            
            {cart.length === 0 ? (
                <div className="alert alert-warning">El carrito está vacío</div>
            ) : (
                <>
                    <div className="list-group mb-4">
                        {cart.map(p => (
                            <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>{p.nombre}</h5>
                                    <p className="mb-0">${p.precioBase} x {p.cantidad} = ${p.precioBase * p.cantidad}</p>
                                </div>
                                <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => eliminarDelCarrito(p.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="card">
                        <div className="card-body">
                            <h3>Total: ${calcularTotal().toFixed(2)}</h3>
                            <button className="btn btn-success btn-lg mt-3">Finalizar Compra</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;