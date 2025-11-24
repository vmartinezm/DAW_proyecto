/**
 * @file public/js/ventas.js
 * @description Gestión frontend del módulo de ventas.
 */

// Importar utilidades de autenticación
import { requireLogin, authFetch } from "./auth.js";

// Asegurar que el usuario está logueado
requireLogin();

// API endpoints
const API_VENTAS = "http://localhost:3000/ventas";
const API_VEHICULOS = "http://localhost:3000/vehiculos";
const API_CLIENTES = "http://localhost:3000/clientes";
const API_USUARIOS_BASIC = "http://localhost:3000/usuarios/basic";

// Selección de elementos DOM
const tableBody = document.querySelector("#ventasTable tbody");
const btnAddVenta = document.getElementById("btnAddVenta");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("ventaModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnCancelar = document.getElementById("btnCancelar");
const grupoCreado = document.getElementById("grupoCreado");
const form = document.getElementById("ventasForm");

// Inputs del formulario agrupados en un objeto
const inputs = {
  id: document.getElementById("venta_id"),
  vehiculo_id: document.getElementById("vehiculo_id"),
  cliente_dni: document.getElementById("cliente_dni"),
  fecha: document.getElementById("fecha"),
  tipo: document.getElementById("tipo"),
  precio_venta: document.getElementById("precio_venta"),
  vendedor_id: document.getElementById("vendedor_id"),
  notas: document.getElementById("notas"),
  creado_at: document.getElementById("creado_at"),
};

// ============================================================================
//  MODAL NUEVO CLIENTE (ELEMENTOS DOM)
// ============================================================================

const clienteModal = document.getElementById("clienteModal");
const btnAddCliente = document.getElementById("btnAddCliente");
const cerrarClienteModal = document.getElementById("cerrarClienteModal");
const clienteForm = document.getElementById("clienteForm");

// ============================================================================
//  UTILIDAD GLOBAL: FETCH + JSON + CONTROL DE ERRORES
// ============================================================================

/**
 * @function fetchJSON
 * @description Realiza un fetch y devuelve JSON, lanzando Error si el status no es OK.
 * @param {string} url - URL a la que hacer la petición
 * @param {RequestInit} [options={}] - Opciones adicionales para fetch
 * @returns {Promise<any>} - JSON parseado de la respuesta
 * @throws {Error} - Si el servidor devuelve un status 4xx/5xx
 */
async function fetchJSON(url, options = {}) {
  const res = await authFetch(url, options);
  let data;

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data;
}

// ============================================================================
//  FUNCIONES DE MODAL VENTA
// ============================================================================

// Abrir el modal de venta
const abrirModalFn = () => {
  modal.style.display = "block";
};

// Cerrar el modal de venta
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos de cierre del modal
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// ============================================================================
//  NAVEGACIÓN
// ============================================================================

btnVolverVehiculos.addEventListener("click", () => {
  window.location.href = "vehiculos.html";
});

btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ============================================================================
//  ABRIR FORMULARIO PARA NUEVA VENTA
// ============================================================================

btnAddVenta.addEventListener("click", async () => {
  formTitle.textContent = "Añadir nueva venta";
  form.dataset.modo = "crear";

  // Reset campos principales
  inputs.id.value = "";
  inputs.fecha.value = "";
  inputs.tipo.value = "";
  inputs.precio_venta.value = "";
  inputs.notas.value = "";
  inputs.creado_at.value = "";

  // Cargar selects
  await cargarVehiculosSelect(false);
  await cargarClientesSelect(false);
  await cargarUsuariosSelect(false);

  // El campo creado_at solo se muestra en edición
  grupoCreado.style.display = "none";

  // Mostrar botón de nuevo cliente
  btnAddCliente.style.display = "block";

  abrirModalFn();
});

// ============================================================================
//  SELECT: VEHÍCULOS
// ============================================================================

/**
 * @function cargarVehiculosSelect
 * @async
 * @description Llena el <select> de vehículos con matrículas disponibles.
 * Bloquea vehículos NO disponibles, salvo que coincidan con vehiculoActual (modo edición).
 * @param {boolean} disabled - Si true, el select queda deshabilitado (modo edición).
 * @param {string|null} [vehiculoActual=null] - Matrícula permitida aunque no esté disponible.
 * @returns {Promise<void>}
 */
async function cargarVehiculosSelect(disabled = false, vehiculoActual = null) {
  try {
    const vehiculos = await fetchJSON(API_VEHICULOS);

    const vehiculoSelect = inputs.vehiculo_id;
    vehiculoSelect.textContent = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar vehículo...";
    vehiculoSelect.appendChild(defaultOption);

    vehiculos.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.matricula;
      option.textContent = `${v.matricula} - ${v.marca} ${v.modelo} (${v.estado})`;

      if (v.estado !== "disponible" && v.matricula !== vehiculoActual) {
        option.disabled = true;
        option.style.color = "#9ca3af";
        option.style.fontStyle = "italic";
      }

      vehiculoSelect.appendChild(option);
    });

    vehiculoSelect.disabled = disabled;
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
    alert("Error al cargar vehículos: " + err.message);
  }
}

// ============================================================================
//  SELECT: CLIENTES
// ============================================================================

/**
 * @function cargarClientesSelect
 * @async
 * @description Llena el <select> de clientes (DNI - nombre completo).
 * @param {boolean} disabled - Si true, el select queda deshabilitado.
 * @param {string|null} [clienteActual=null] - DNI a seleccionar automáticamente.
 * @returns {Promise<void>}
 */
async function cargarClientesSelect(disabled = false, clienteActual = null) {
  try {
    const clientes = await fetchJSON(API_CLIENTES);

    const clienteSelect = inputs.cliente_dni;
    clienteSelect.textContent = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar cliente...";
    clienteSelect.appendChild(defaultOption);

    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.dni;
      option.textContent = `${c.dni} - ${c.nombre} ${c.apellidos}`;
      clienteSelect.appendChild(option);
    });

    if (clienteActual) clienteSelect.value = clienteActual;

    clienteSelect.disabled = disabled;
  } catch (err) {
    console.error("Error al cargar clientes:", err);
    alert("Error al cargar clientes: " + err.message);
  }
}

// ============================================================================
//  SELECT: USUARIOS (VENDEDORES)
// ============================================================================

/**
 * @function cargarUsuariosSelect
 * @async
 * @description Llena el <select> con usuarios del sistema (empleados/vendedores).
 * @param {boolean} disabled - Si true, el select queda deshabilitado.
 * @param {string|null} [vendedorActual=null] - ID de usuario a seleccionar.
 * @returns {Promise<void>}
 */
async function cargarUsuariosSelect(disabled = false, vendedorActual = null) {
  try {
    const usuarios = await fetchJSON(API_USUARIOS_BASIC);

    const usuarioSelect = inputs.vendedor_id;
    usuarioSelect.textContent = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar vendedor...";
    usuarioSelect.appendChild(defaultOption);

    usuarios.forEach((u) => {
      const option = document.createElement("option");
      option.value = u.user_id;
      option.textContent = `${u.user_id} - ${u.nombre} ${u.apellidos}`;
      usuarioSelect.appendChild(option);
    });

    usuarioSelect.disabled = disabled;
    if (vendedorActual) usuarioSelect.value = vendedorActual;
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    alert("Error al cargar usuarios: " + err.message);
  }
}

// ============================================================================
//  CARGAR LISTA DE VENTAS EN TABLA
// ============================================================================

/**
 * @function cargarVentas
 * @async
 * @description Obtiene todas las ventas del backend y las renderiza en la tabla HTML.
 * @returns {Promise<void>}
 */
async function cargarVentas() {
  try {
    const ventas = await fetchJSON(API_VENTAS);

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    ventas.forEach((v) => {
      const row = document.createElement("tr");

      const fechaFmt = v.fecha
        ? new Date(v.fecha).toLocaleDateString("es-ES")
        : "";
      const creadoFmt = v.creado_at
        ? new Date(v.creado_at).toLocaleDateString("es-ES")
        : "";
      const precioFmt =
        v.precio_venta != null
          ? new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(v.precio_venta)
          : "";

      [
        v.venta_id,
        v.vehiculo_id,
        v.cliente_dni,
        fechaFmt,
        v.tipo,
        precioFmt,
        v.vendedor_id,
        v.notas,
        creadoFmt,
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor ?? "";
        row.appendChild(td);
      });

      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.dataset.id = v.venta_id;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = v.venta_id;

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar ventas:", err);
    alert("Error al cargar ventas: " + err.message);
  }
}

// ============================================================================
//  EDITAR VENTA
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    form.dataset.modo = "editar";
    formTitle.textContent = "Editar venta";

    try {
      const venta = await fetchJSON(`${API_VENTAS}/${id}`);

      await cargarVehiculosSelect(true, venta.vehiculo_id);
      await cargarClientesSelect(true, venta.cliente_dni);
      await cargarUsuariosSelect(false, venta.vendedor_id);

      inputs.id.value = venta.venta_id;
      inputs.vehiculo_id.value = venta.vehiculo_id;
      inputs.cliente_dni.value = venta.cliente_dni;
      inputs.fecha.value = venta.fecha ? venta.fecha.split("T")[0] : "";
      inputs.tipo.value = venta.tipo;
      inputs.precio_venta.value = venta.precio_venta;
      inputs.vendedor_id.value = venta.vendedor_id;
      inputs.notas.value = venta.notas ?? "";
      inputs.creado_at.value = venta.creado_at
        ? venta.creado_at.split("T")[0]
        : "";

      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      // En edición no queremos que se añadan clientes desde aquí
      btnAddCliente.style.display = "none";

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar venta para edición:", err);
      alert("Error al cargar venta: " + err.message);
    }
  }
});

// ============================================================================
//  GUARDAR VENTA (CREAR / EDITAR)
// ============================================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    vehiculo_id: inputs.vehiculo_id.value,
    cliente_dni: inputs.cliente_dni.value,
    fecha: inputs.fecha.value,
    tipo: inputs.tipo.value,
    precio_venta: inputs.precio_venta.value,
    vendedor_id: inputs.vendedor_id.value,
    notas: inputs.notas.value,
  };

  const modo = form.dataset.modo;
  let url = API_VENTAS;
  let metodo = "POST";

  if (modo === "editar") {
    metodo = "PUT";
    url = `${API_VENTAS}/${inputs.id.value}`;
  }

  try {
    const data = await fetchJSON(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    alert(data.mensaje || "Venta guardada correctamente");
    cerrarModalFn();
    cargarVentas();
  } catch (err) {
    console.error("Error al guardar venta:", err);
    alert(err.message);
  }
});

// ============================================================================
//  ELIMINAR VENTA
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar esta venta?")) return;

    try {
      const data = await fetchJSON(`${API_VENTAS}/${id}`, { method: "DELETE" });
      alert(data.mensaje || "Venta eliminada correctamente");
      cargarVentas();
    } catch (err) {
      console.error("Error al eliminar venta:", err);
      alert(err.message);
    }
  }
});

// ============================================================================
//  MODAL NUEVO CLIENTE DESDE VENTAS
// ============================================================================

/** Abre el mini-modal de creación rápida de cliente */
btnAddCliente.addEventListener("click", () => {
  clienteModal.style.display = "block";
});

/** Cierra el mini-modal de cliente */
cerrarClienteModal.addEventListener("click", () => {
  clienteModal.style.display = "none";
});

// Cerrar mini-modal si se hace clic fuera
window.addEventListener("click", (e) => {
  if (e.target === clienteModal) clienteModal.style.display = "none";
});

// ============================================================================
//  SUBMIT NUEVO CLIENTE (DESDE MODAL)
// ============================================================================

clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dni = document.getElementById("cliente_dni_nuevo").value.trim();
  const nombre = document.getElementById("cliente_nombre_nuevo").value.trim();
  const apellidos = document
    .getElementById("cliente_apellidos_nuevo")
    .value.trim();
  const email = document.getElementById("cliente_email_nuevo").value.trim();
  const telefono = document
    .getElementById("cliente_telefono_nuevo")
    .value.trim();
  const direccion = document
    .getElementById("cliente_direccion_nuevo")
    .value.trim();

  try {
    const data = await fetchJSON(API_CLIENTES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni,
        nombre,
        apellidos,
        email,
        telefono,
        direccion,
      }),
    });

    alert(data.mensaje || "Cliente creado correctamente");
    clienteModal.style.display = "none";
    clienteForm.reset();

    // Recargar el select de clientes y seleccionar al nuevo
    await cargarClientesSelect(false, dni);
    btnAddCliente.style.display = "none";
  } catch (err) {
    console.error("Error al crear cliente:", err);
    alert(err.message);
  }
});

// ============================================================================
//  INICIALIZACIÓN
// ============================================================================

window.addEventListener("DOMContentLoaded", cargarVentas);
