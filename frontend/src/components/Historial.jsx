import { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon } from 'lucide-react';

export default function Historial() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/ventas')
      .then(res => setVentas(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <HistoryIcon size={20} /> Historial de Ventas
      </h2>

      {ventas.length === 0 ? (
        <p className="text-gray-500 text-sm">Aún no se han registrado ventas.</p>
      ) : (
        <div className="space-y-3">
          {ventas.map(venta => (
            <div key={venta.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">Venta #{venta.id} - {venta.producto}</p>
                <p className="text-sm text-gray-500">
                  {venta.cantidad} unidades | {venta.fecha} | Vendedor: {venta.vendedor}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">S/ {venta.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}