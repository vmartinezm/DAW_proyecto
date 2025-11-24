/**
 * @file public/js/clientes.js
 * @description Gestión frontend del módulo de clientes.
 * @module clientes
 */

// Importar utilidades de autenticación
import { requireLogin, authFetch } from "./auth.js";

// Asegurar que el usuario está logueado
requireLogin();

//API ENDPOINT
const API_CLIENTES = "http://localhost:3000/clientes";

// Elementos del DOM
const tableBody = document.querySelector("#clientesTable tbody");
const btnAddCliente = document.getElementById("btnAddCliente");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("clientesModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const form = document.getElementById("clientesForm");
const grupoCreado = document.getElementById("grupoCreado");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs del formulario agrupados en un objeto
const inputs = {
  dni: document.getElementById("dni"),
  nombre: document.getElementById("nombre"),
  apellidos: document.getElementById("apellidos"),
  email: document.getElementById("email"),
  telefono: document.getElementById("telefono"),
  direccion: document.getElementById("direccion"),
  creado_at: document.getElementById("creado_at"),
};

// ============================================================================
//  UTILIDAD GLOBAL FETCH JSON
// ============================================================================

/**
 * @function fetchJSON
 * @description Wrapper general para fetch+JSON con control de errores de backend
 * @async
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 * @throws {Error}
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
//  LIMPIAR FORMULARIO
// ============================================================================

/**
 * @function limpiarFormulario
 * @description Restablece el formulario a modo "crear"
 * @returns {void}
 */
function limpiarFormulario() {
  form.reset();
  form.dataset.modo = "crear";

  inputs.dni.disabled = false;
  inputs.creado_at.disabled = true;
  grupoCreado.style.display = "none";
}

// ============================================================================
//  MODAL
// ============================================================================

// Abrir modal
const abrirModalFn = () => {
  modal.style.display = "block";
};

// Cerrar modal
const cerrarModalFn = () => {
  modal.style.display = "none";
  limpiarFormulario();
};

// Eventos cierre modal
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
//  NUEVO CLIENTE
// ============================================================================

btnAddCliente.addEventListener("click", () => {
  limpiarFormulario();
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo cliente";
  abrirModalFn();
});

// ============================================================================
//  CARGAR CLIENTES EN TABLA
// ============================================================================

/**
 * @function cargarClientes
 * @description Obtiene clientes y los renderiza en la tabla
 * @async
 * @returns {Promise<void>}
 */
async function cargarClientes() {
  try {
    const clientes = await fetchJSON(API_CLIENTES);

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    clientes.forEach((c) => {
      const row = document.createElement("tr");

      const creadoFmt = c.creado_at
        ? new Date(c.creado_at).toLocaleDateString("es-ES")
        : "";

      [
        c.dni,
        c.nombre,
        c.apellidos,
        c.email,
        c.telefono,
        c.direccion,
        creadoFmt,
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      const accionesTd = document.createElement("td");
      accionesTd.innerHTML = `
        <button class="btn-editar" data-id="${c.dni}">Editar</button>
        <button class="btn-eliminar" data-id="${c.dni}">Eliminar</button>
      `;
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar clientes:", err);
    alert(err.message);
  }
}

// ============================================================================
//  EDITAR CLIENTE
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    try {
      const cliente = await fetchJSON(`${API_CLIENTES}/${id}`);

      limpiarFormulario();
      form.dataset.modo = "editar";
      formTitle.textContent = "Editar cliente";

      inputs.dni.value = cliente.dni;
      inputs.nombre.value = cliente.nombre;
      inputs.apellidos.value = cliente.apellidos;
      inputs.email.value = cliente.email;
      inputs.telefono.value = cliente.telefono;
      inputs.direccion.value = cliente.direccion;
      inputs.creado_at.value = cliente.creado_at
        ? cliente.creado_at.split("T")[0]
        : "";

      inputs.dni.disabled = true;
      grupoCreado.style.display = "block";

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar cliente:", err);
      alert(err.message);
    }
  }
});

// ============================================================================
//  GUARDAR CLIENTE (crear o editar)
// ============================================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    dni: inputs.dni.value,
    nombre: inputs.nombre.value,
    apellidos: inputs.apellidos.value,
    email: inputs.email.value,
    telefono: inputs.telefono.value,
    direccion: inputs.direccion.value,
  };

  const modo = form.dataset.modo;
  let url = API_CLIENTES;
  let metodo = "POST";

  if (modo === "editar") {
    metodo = "PUT";
    url = `${API_CLIENTES}/${inputs.dni.value}`;
  }

  try {
    const data = await fetchJSON(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    alert(data.mensaje || "Cliente guardado correctamente");
    cerrarModalFn();
    cargarClientes();
  } catch (err) {
    console.error("Error al guardar cliente:", err);
    alert(err.message);
  }
});

// ============================================================================
//  ELIMINAR CLIENTE
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    try {
      const data = await fetchJSON(`${API_CLIENTES}/${id}`, {
        method: "DELETE",
      });
      alert(data.mensaje || "Cliente eliminado correctamente");
      cargarClientes();
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      alert(err.message);
    }
  }
});

// ============================================================================
//  INICIALIZACIÓN
// ============================================================================

window.addEventListener("DOMContentLoaded", cargarClientes);
