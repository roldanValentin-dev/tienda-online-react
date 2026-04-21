import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Delay artificial de 2 segundos para ver el skeleton
        setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/catalogo/productos`).then(res => {
                setProducts(res.data);
                setLoading(false);
            }).catch(err => {
                console.error(`error al cargar productos ${err}`);
                setError(err);
                setLoading(false);
            });
        }, 2000);
    },[]);
    
    const getProductById = (id) => {
        return products.find(p => p.id === parseInt(id));
    };

    return { products, loading, error, getProductById };
};
