/**
 * @file vehiculos.js
 * @description Lógica frontend para gestión de vehículos en la aplicación.
 * Incluye protección por sesión (JWT), carga dinámica de datos, modal CRUD y
 * comunicación con el backend usando authFetch().
 */

import { requireLogin, authFetch } from "./auth.js";

/**
 * Protege el acceso a la página:
 * - Si no hay sesión activa → se redirige a login.html automáticamente
 */
requireLogin();

/**
 * @constant {string} API_URL Ruta base del backend para gestión de vehículos
 */
const API_URL = "http://localhost:3000/vehiculos";

/**
 * Referencias a elementos DOM principales
 * @constant
 */
const tableBody = document.querySelector("#vehiculosTable tbody");
const btnAddVehiculo = document.getElementById("btnAddVehiculo");
const modal = document.getElementById("vehiculoModal");
const cerrarModal = document.getElementById("cerrarModal");
const vehiculoForm = document.getElementById("vehiculoForm");
const formTitle = document.getElementById("form-title");
const btnCancelar = document.getElementById("btnCancelar");

/**
 * Inputs del formulario agrupados en un objeto
 * @typedef VehiculoInputs
 * @property {HTMLInputElement} matricula
 * @property {HTMLInputElement} marca
 * @property {HTMLInputElement} modelo
 * @property {HTMLInputElement} version
 * @property {HTMLInputElement} color
 * @property {HTMLInputElement} ano
 * @property {HTMLInputElement} kilometros
 * @property {HTMLInputElement} combustible
 * @property {HTMLInputElement} precio
 * @property {HTMLInputElement} estado
 */
const inputs = {
  matricula: document.getElementById("matricula"),
  marca: document.getElementById("marca"),
  modelo: document.getElementById("modelo"),
  version: document.getElementById("version"),
  color: document.getElementById("color"),
  ano: document.getElementById("ano"),
  kilometros: document.getElementById("kilometros"),
  combustible: document.getElementById("combustible"),
  precio: document.getElementById("precio"),
  estado: document.getElementById("estado"),
};

/**
 * @type {boolean} Indica si el formulario está en modo edición o en modo creación
 */
let modoEdicion = false;

/**
 * Muestra el modal de formulario
 */
function abrirModal() {
  modal.style.display = "block";
}

/**
 * Cierra el modal y resetea el formulario
 */
function cerrarModalFn() {
  modal.style.display = "none";
  resetFormulario();
}

// ============================
// MODAL — eventos de cierre
// ============================

cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// ============================
// CARGAR VEHÍCULOS
// ============================

/**
 * Obtiene la lista de vehículos desde el backend (autorizado) y los renderiza en la tabla
 * @async
 */
async function cargarVehiculos() {
  try {
    const res = await authFetch(API_URL);
    const data = await res.json();

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    data.forEach((v) => {
      const row = document.createElement("tr");

      const precioFmt =
        v.precio != null
          ? new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(v.precio)
          : "";

      const kmFmt =
        v.kilometros != null
          ? new Intl.NumberFormat("es-ES", {
              style: "unit",
              unit: "kilometer",
              unitDisplay: "short",
            }).format(v.kilometros)
          : "";

      [
        v.matricula,
        v.marca,
        v.modelo,
        v.version ?? "",
        v.color ?? "",
        v.ano ?? "",
        kmFmt,
        v.combustible ?? "",
        precioFmt,
        v.estado ?? "",
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarVehiculo(v));

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.addEventListener("click", () =>
        eliminarVehiculo(v.matricula)
      );

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);
      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    alert("Error cargando vehículos: " + err.message);
  }
}

// ============================
// NUEVO VEHÍCULO
// ============================

btnAddVehiculo.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo vehículo";
  abrirModal();
  resetFormulario();
  modoEdicion = false;
  inputs.matricula.disabled = false;
});

// ============================
// EDITAR VEHÍCULO
// ============================

/**
 * Rellena el formulario con los datos de un vehículo para edición
 * @param {Object} v Objeto vehículo
 */
function editarVehiculo(v) {
  formTitle.textContent = "Editar vehículo";
  Object.keys(inputs).forEach((k) => (inputs[k].value = v[k] ?? ""));
  abrirModal();
  modoEdicion = true;
  inputs.matricula.disabled = true;
}

// ============================
// RESET FORMULARIO
// ============================

/**
 * Vacía el formulario y restaura estado interno
 */
function resetFormulario() {
  vehiculoForm.reset();
  inputs.matricula.disabled = false;
  modoEdicion = false;
}

// ============================
// GUARDAR — CREAR / EDITAR
// ============================

vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vehiculo = {
    marca: inputs.marca.value.trim(),
    modelo: inputs.modelo.value.trim(),
    version: inputs.version.value.trim(),
    color: inputs.color.value.trim(),
    ano: parseInt(inputs.ano.value) || null,
    kilometros: parseInt(inputs.kilometros.value) || null,
    combustible: inputs.combustible.value,
    precio: parseFloat(inputs.precio.value) || null,
    estado: inputs.estado.value,
  };

  let url = API_URL;
  let method = "POST";

  if (modoEdicion) {
    method = "PUT";
    url = `${API_URL}/${inputs.matricula.value}`;
  } else {
    vehiculo.matricula = inputs.matricula.value.trim();
  }

  try {
    const res = await authFetch(url, {
      method,
      body: JSON.stringify(vehiculo),
    });

    // importante: leer respuesta
    const data = await res.json();

    // si backend devolvió error
    if (data.error) {
      alert(data.error);
      return;
    }

    alert(data.mensaje || "Vehículo guardado correctamente");
    cerrarModalFn();
    cargarVehiculos();
  } catch (err) {
    alert("Error guardando vehículo: " + err.message);
  }
});

// ============================
// ELIMINAR VEHÍCULO
// ============================

/**
 * Solicita confirmación y elimina vehículo en backend
 * @async
 * @param {string} matricula
 */
async function eliminarVehiculo(matricula) {
  if (!confirm("¿Seguro que quieres eliminar este vehículo?")) return;

  try {
    await authFetch(`${API_URL}/${matricula}`, { method: "DELETE" });
    cargarVehiculos();
  } catch (err) {
    alert("Error eliminando vehículo: " + err.message);
  }
}

// ============================
// NAVEGACIÓN
// ============================

document.getElementById("btnAddMantenimiento").addEventListener("click", () => {
  window.location.href = "mantenimientos.html";
});

document.getElementById("btnAddVenta").addEventListener("click", () => {
  window.location.href = "ventas.html";
});

document.getElementById("btnIrDashboard").addEventListener("click", () => {
  window.location.href = "index.html";
});

// ============================
// EJECUCIÓN INICIAL
// ============================

window.addEventListener("DOMContentLoaded", cargarVehiculos);