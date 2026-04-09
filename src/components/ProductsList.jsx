import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";

function ProductsList() {
    const { products, loading, agregarAlCarrito } = useContext(CarritoContext);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Products</h1>
            {loading && (
                <div className="alert alert-info">Cargando productos...</div>
            )}
            <div className="row">
                {products.map(p => (
                    <div key={p.id} className="col-md-4 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{p.nombre}</h5>
                                <p className="card-text">${p.precioBase}</p>
                                 <p className="card-text">{p.categoria}</p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => agregarAlCarrito(p)}
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductsList;