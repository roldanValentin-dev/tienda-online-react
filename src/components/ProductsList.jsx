import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";

function ProductsList() {
    const { products, loading, agregarAlCarrito ,category,selectCategory,setSelectCategory} = useContext(CarritoContext);

    return (
     <div className="container mt-4">
            <h1 className="mb-4 text-center">Nuestros Productos</h1>

            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-center flex-wrap gap-2">
                        {category.map((cat, index) => (
                            <button
                                key={index}
                                className={`btn ${selectCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {loading && (
                <div className="alert alert-info text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando productos...</p>
                </div>
            )}
            <div className="row">
                {products.filter(p => p.activo).map(p => (
                    <div key={p.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card product-card h-100">
                            <img 
                                src={p.imagenUrl || 'https://via.placeholder.com/300x200'} 
                                className="card-img-top" 
                                alt={p.nombre}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <div className="mb-2">
                                    <span className="badge bg-secondary">{p.categoria}</span>
                                </div>
                                <h5 className="card-title">{p.nombre}</h5>
                                <p className="card-text text-muted small">{p.descripcion}</p>
                                <div className="mt-auto">
                                    <p className="h4 text-primary mb-3">${p.precioBase.toLocaleString()}</p>
                                    <button 
                                        className="btn btn-primary w-100" 
                                        onClick={() => agregarAlCarrito(p)}
                                    >
                                        <i className="bi bi-cart-plus"></i> Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {/* Mensaje si no hay productos */}
            {!loading && products.filter(p => p.activo).length === 0 && (
                <div className="alert alert-warning text-center">
                    No hay productos disponibles en esta categoría
                </div>
            )}
        </div>
    );
}

export default ProductsList;