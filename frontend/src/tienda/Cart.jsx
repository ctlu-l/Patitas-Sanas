import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { useNavigate } from 'react-router-dom'; 
import { jsPDF } from "jspdf";
import './Tienda.css';

const Cart = () => {
  const { carrito, eliminarDelCarrito } = useContext(CartContext);
  const navigate = useNavigate(); 

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const generarTicket = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Ticket de Compra", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Patitas Sanas", 105, 30, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.text("Cant.", 20, 45);
    doc.text("Artículo", 40, 45);
    doc.text("Subtotal", 160, 45);
    
    let y = 55; 
    
    carrito.forEach((item) => {
      doc.text(`${item.cantidad}`, 20, y);
      doc.text(`${item.nombre}`, 40, y);
      doc.text(`$${(item.precio * item.cantidad).toFixed(2)}`, 160, y);
      y += 10; 
    });

    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Total Pagado: $${total.toFixed(2)}`, 160, y, { align: "right" });

    const fecha = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fecha}`, 20, y + 20);

    doc.save("ticket_patitas_sanas.pdf");
  };
  const procesarPago = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/login', { state: { returnTo: '/portal-cliente' } });
    } else {
      navigate('/portal-cliente');
    }
  };

  return (
    <div className="ticket-container">
      <h2>Ticket de Compra </h2>
      
      {carrito.length === 0 ? (
        <p className="carrito-vacio">El ticket está vacío. Agrega productos para comenzar.</p>
      ) : (
        <>
          <ul className="lista-ticket">
            {carrito.map((item) => (
              <li key={item.id} className="item-ticket">
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-cantidad">Cant: {item.cantidad} x ${item.precio}</span>
                </div>
                <div className="item-acciones">
                  <span className="item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</span>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="btn-quitar">❌</button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="ticket-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <button className="btn-pagar" onClick={procesarPago}>
            Confirmar en mi Portal
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;