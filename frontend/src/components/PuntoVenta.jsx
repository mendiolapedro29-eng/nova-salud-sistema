import { useState } from 'react';
import axios from 'axios';
import { ShoppingBag, CreditCard } from 'lucide-react';

export default function PuntoVenta({ productos, alRealizarVenta }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState(null);
  const usuario = localStorage.getItem('usuarioLogueado') || 'Invitado';

  const handleVenta = (e) => {
    e.preventDefault();
    setMensaje(null);
    axios.post('http://localhost:3001/api/ventas', {
      productoId: parseInt(productoId), cantidad: parseInt(cantidad), vendedor: usuario
    })
    .then(res => {
      setMensaje({ tipo: 'exito', texto: `Venta #${res.data.venta.id} registrada. Total: S/ ${res.data.venta.total}` });
      setCantidad(1); setProductoId('');
      alRealizarVenta();
    })
    .catch(err => setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al procesar la venta' }));
  };

  const productoSeleccionado = productos.find(p => p.id === parseInt(productoId));

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
          <ShoppingBag size={24} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Módulo de Ventas</h2>
        <p className="text-slate-500">Registra la salida de productos del inventario.</p>
      </div>

      {mensaje && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-3 ${
          mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleVenta} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Medicamento a vender</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-700 transition-shadow"
              value={productoId} onChange={(e) => setProductoId(e.target.value)} required
            >
              <option value="">-- Seleccionar producto del catálogo --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.nombre} (Stock: {p.stock}) - S/ {p.precio}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad a despachar</label>
            <input 
              type="number" min="1" max={productoSeleccionado?.stock || 1}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition-shadow"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} required
            />
          </div>
          <div className="flex items-end">
             {productoSeleccionado && (
              <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total a cobrar</p>
                <p className="text-2xl font-bold text-slate-900">S/ {(productoSeleccionado.precio * cantidad).toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!productoSeleccionado}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
        >
          <CreditCard size={20} /> Confirmar y Registrar Venta
        </button>
      </form>
    </div>
  );
}