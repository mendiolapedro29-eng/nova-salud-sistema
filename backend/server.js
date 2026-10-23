const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Datos de prueba en memoria
let productos = [
  { id: 1, nombre: 'Paracetamol 500mg', precio: 1.5, stock: 50, stockMinimo: 10 },
  { id: 2, nombre: 'Ibuprofeno 400mg', precio: 2.0, stock: 8, stockMinimo: 10 },
  { id: 3, nombre: 'Amoxicilina 500mg', precio: 3.5, stock: 30, stockMinimo: 10 },
];

// Arreglo para guardar el historial de ventas
let historialVentas = [];

app.get('/', (req, res) => {
  res.send('API de Botica Nova Salud funcionando');
});

// --- RUTAS DE PRODUCTOS ---

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  res.json(productos);
});

// Nueva ruta: Agregar un producto
app.post('/api/productos', (req, res) => {
  const { nombre, precio, stock, stockMinimo } = req.body;
  
  const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  
  const nuevoProducto = {
    id: nuevoId,
    nombre,
    precio: parseFloat(precio),
    stock: parseInt(stock),
    stockMinimo: parseInt(stockMinimo)
  };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

// NUEVA RUTA: Reponer Stock
app.put('/api/productos/:id/reponer', (req, res) => {
  const productoId = parseInt(req.params.id);
  const { cantidad } = req.body;
  
  const producto = productos.find(p => p.id === productoId);
  
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  if (cantidad <= 0) return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });

  producto.stock += parseInt(cantidad);
  res.json({ mensaje: 'Stock repuesto', producto });
});

// --- RUTAS DE VENTAS ---

// Obtener historial de ventas
app.get('/api/ventas', (req, res) => {
  res.json(historialVentas);
});

// Registrar una venta
app.post('/api/ventas', (req, res) => {
  const { productoId, cantidad, vendedor } = req.body;
  
  const producto = productos.find(p => p.id === productoId);
  
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  if (producto.stock < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });

  producto.stock -= cantidad;

  const nuevaVenta = {
    id: historialVentas.length + 1,
    fecha: new Date().toLocaleString(),
    producto: producto.nombre,
    cantidad: cantidad,
    total: (producto.precio * cantidad).toFixed(2),
    vendedor: vendedor || 'Invitado'
  };

  historialVentas.unshift(nuevaVenta);

  const alerta = producto.stock <= producto.stockMinimo
    ? `¡Alerta! ${producto.nombre} tiene stock bajo (${producto.stock} unidades).`
    : null;

  res.json({ mensaje: 'Venta registrada con éxito', venta: nuevaVenta, alerta });
});

// --- NUEVA RUTA: ESTADÍSTICAS ---
app.get('/api/estadisticas', (req, res) => {
  const totalVentas = historialVentas.reduce((acc, venta) => acc + parseFloat(venta.total), 0);
  const alertasCriticas = productos.filter(p => p.stock <= p.stockMinimo).length;
  
  const conteoProductos = {};
  historialVentas.forEach(v => {
    conteoProductos[v.producto] = (conteoProductos[v.producto] || 0) + v.cantidad;
  });
  
  let masVendido = 'Ninguno aún';
  let maxCantidad = 0;
  for (const [nombre, cant] of Object.entries(conteoProductos)) {
    if (cant > maxCantidad) {
      masVendido = nombre;
      maxCantidad = cant;
    }
  }

  res.json({
    totalVentasHoy: totalVentas.toFixed(2),
    cantidadProductos: productos.length,
    alertasCriticas,
    masVendido
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});