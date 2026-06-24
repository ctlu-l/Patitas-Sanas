import React, { useState, useEffect, useContext } from 'react';
import ProductCard from './ProductCard'; 
import Cart from './Cart'; 
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Tienda.css';

const Store = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const { carrito } = useContext(CartContext);
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .gt('stock', 0)
        .order('id', { ascending: true });

      if (error) console.error("Error al cargar productos:", error);
      else setProductos(data);
      
      setLoading(false);
    };

    fetchProductos();
  }, []);

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Cargando catálogo...</p>;

  return (
    <div className="tienda-container">
      
      
      <div className="navegacion-tienda flex-nav">
        
        <Link to="/" className="btn-volver">← Volver al Inicio</Link>
        
        <h1 className="tienda-titulo">
          {mostrarTicket ? "Finalizar Compra" : "Catálogo Patitas Sanas"}
        </h1>

        <button 
          className="btn-ver-carrito"
          onClick={() => setMostrarTicket(!mostrarTicket)}
        >
          {mostrarTicket ? "← Seguir Comprando" : `Finalizar Compra (${totalArticulos})`}
        </button>
        
      </div>
      {mostrarTicket ? (
        <div className="ticket-centrado">
          <Cart />
        </div>
      ) : (
        <div className="grid-productos">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default Store;