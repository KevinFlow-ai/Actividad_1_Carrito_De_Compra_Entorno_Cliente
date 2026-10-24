// La clase guarda los productos y hace los cálculos.
class Carrito {

  constructor(productos, moneda = "€") {
    this.productos = productos;
    this.moneda = moneda;
    
    for (const producto of productos) { // recorremos los productos y convertimos los precios a número, inicializamos cantidad y subtotal
      producto.price = Number(producto.price);
      producto.quantity = 0;
      producto.subtotal = 0;
    }
  }

  obtenerInformacionProducto(sku) {
    return this.productos.find(producto => producto.ID_Producto === sku);
  }

  actualizarUnidades(sku, unidades) {
    const producto = this.obtenerInformacionProducto(sku);
    producto.quantity = Math.max(0, unidades); // no permitimos cantidades negativas
    producto.subtotal = Number((producto.price * producto.quantity).toFixed(2)); // redondeamos a dos decimales
  }

  obtenerCarrito() { // devuelve un objeto con los productos que tienen cantidad > 0 y el total
  const products = this.productos.filter(producto => producto.quantity > 0);
  let total = 0;

  for (const producto of products) {
    total += producto.subtotal;
  }



  
  total = Number(total.toFixed(2));
  const iva = Number((total * 0.21).toFixed(2));
  const totalConIVA = Number((total + iva).toFixed(2));

  return {
    products,
    total: Number(total.toFixed(2)),
    iva,
    totalConIVA,
    currency: this.moneda
    
  }
}
  
}

let carrito;
const tabla = document.querySelector("#productos");
const resumen = document.querySelector("#resumen");
const total = document.querySelector("#total");
const estado = document.querySelector("#estado");


const subtotal = document.querySelector("#subtotal");
const iva = document.querySelector("#iva");

function dinero(numero) {
  return numero.toFixed(2) + " " + carrito.moneda;
}

// Una sola función dibuja toda la pantalla.
function mostrar() {
  tabla.replaceChildren();
  resumen.replaceChildren();

  for (const producto of carrito.productos) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><strong></strong><small></small></td>
      <td class="cantidad">
        <button type="button" class="menos" aria-label="Quitar una unidad">−</button>
        <input type="text" readonly aria-label="Cantidad">
        <button type="button" class="mas" aria-label="Añadir una unidad">+</button>
      </td>
      <td class="precio"></td><td class="subtotal"></td>
    `;
    fila.querySelector("strong").textContent = producto.title;
    fila.querySelector("small").textContent = "REF: " + producto.ID_Producto;
    fila.querySelector("input").value = producto.quantity;
    fila.querySelector(".precio").textContent = dinero(producto.price);
    fila.querySelector(".subtotal").textContent = dinero(producto.subtotal);
    fila.querySelector(".menos").onclick = () => cambiar(producto.ID_Producto, -1);
    fila.querySelector(".mas").onclick = () => cambiar(producto.ID_Producto, 1);
    tabla.append(fila);
  }

  const datos = carrito.obtenerCarrito();
  for (const producto of datos.products) {
    const li = document.createElement("li");
    li.textContent = `${producto.quantity} × ${producto.title}: ${dinero(producto.subtotal)}`;
    resumen.append(li);
  }

  // Mostramos los totales.
  subtotal.textContent = dinero(datos.total);
  iva.textContent = dinero(datos.iva);
  total.textContent = dinero(datos.totalConIVA);
}

// Cada botón cambia una cantidad y vuelve a dibujar la pantalla.
function cambiar(sku, cambio) {
  const producto = carrito.obtenerInformacionProducto(sku);
  carrito.actualizarUnidades(sku, producto.quantity + cambio);
  mostrar();
}

//Pedimos los productos e iniciamos el carrito.
const URL_API = "api.php";

async function iniciar() { // carga los productos desde el servidor y crea el carrito

  try {
    const respuesta = await fetch(URL_API);
    if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);

    const datos = await respuesta.json();
    carrito = new Carrito(datos.products, datos.Coin);

    mostrar();
    estado.textContent = "Productos cargados. Usa − y + para cambiar las unidades.";

  } catch (error) {
    estado.textContent = "No se pudieron cargar los productos: " + error.message;
  }
  
}

iniciar();
