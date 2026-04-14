import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/catalogo/productos`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error al cargar productos:', err);
                setError(err);
                setLoading(false);
            });
    }, []);

    const getProductById = (id) => {
        return products.find(p => p.id === parseInt(id));
    };

    return { products, loading, error, getProductById };
};
