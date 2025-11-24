/**
 * @file public/js/mantenimientos.js
 * @description Gestión frontend del módulo de mantenimientos.
 * Incluye protección de acceso, carga dinámica, renderizado de datos y CRUD.
 * @module mantenimientos
 */

// Importar utilidades de autenticación
import { requireLogin, authFetch } from "./auth.js";

// Protección de acceso: requiere login
requireLogin();

// API endpoints
const API_MANTENIMIENTOS = "http://localhost:3000/mantenimientos";
const API_VEHICULOS = "http://localhost:3000/vehiculos";
const API_USUARIOS_BASIC = "http://localhost:3000/usuarios/basic";

// Selección de elementos del DOM
const tableBody = document.querySelector("#mantenimientosTable tbody");
const btnAddMantenimiento = document.getElementById("btnAddMantenimiento");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("mantenimientoModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnCancelar = document.getElementById("btnCancelar");
const grupoCreado = document.getElementById("grupoCreado");
const form = document.getElementById("mantenimientoForm");

// Inputs del formulario agrupados en un objeto
const inputs = {
  id: document.getElementById("mantenimiento_id"),
  vehiculo_id: document.getElementById("vehiculo_id"),
  fecha_inicio: document.getElementById("fecha_inicio"),
  fecha_fin: document.getElementById("fecha_fin"),
  descripcion: document.getElementById("descripcion"),
  realizado_por: document.getElementById("realizado_por"),
  coste: document.getElementById("coste"),
  creado_at: document.getElementById("creado_at"),
};

// ============================================================================
//  UTILIDAD GLOBAL FETCH → JSON CON CONTROL DE ERRORES
// ============================================================================

/**
 * @function fetchJSON
 * @description Hace fetch autenticado + parsea JSON con manejo seguro de errores backend
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
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
//  MODAL
// ============================================================================

//  Abre modal
const abrirModalFn = () => {
  modal.style.display = "block";
};

// Cierra modal
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos de apertura/cierre modal
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
//  ABRIR MODAL PARA CREAR MANTENIMIENTO
// ============================================================================

btnAddMantenimiento.addEventListener("click", async () => {
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo mantenimiento";

  Object.values(inputs).forEach((i) => (i.value = ""));

  await cargarVehiculosSelect(false);
  await cargarUsuariosSelect(false);

  grupoCreado.style.display = "none";

  abrirModalFn();
});

// ============================================================================
//  SELECT VEHÍCULOS
// ============================================================================

/**
 * @function cargarVehiculosSelect
 * @async
 * @description Carga lista de vehículos en el selector
 * @param {boolean} disabled
 * @param {string|null} vehiculoActual
 */
async function cargarVehiculosSelect(disabled = false, vehiculoActual = null) {
  try {
    const vehiculos = await fetchJSON(API_VEHICULOS);
    const vehiculoSelect = inputs.vehiculo_id;
    vehiculoSelect.textContent = "";

    const def = document.createElement("option");
    def.value = "";
    def.textContent = "Seleccionar vehículo...";
    vehiculoSelect.appendChild(def);

    vehiculos.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.matricula;
      option.textContent = `${v.matricula} - ${v.marca} ${v.modelo} (${v.estado})`;

      if (v.estado !== "disponible" && v.matricula !== vehiculoActual) {
        option.disabled = true;
        option.style.opacity = 0.5;
      }

      vehiculoSelect.appendChild(option);
    });

    vehiculoSelect.disabled = disabled;
  } catch (err) {
    alert("Error cargando vehículos: " + err.message);
  }
}

// ============================================================================
//  SELECT USUARIOS
// ============================================================================

/**
 * @function cargarUsuariosSelect
 * @async
 * @description Carga lista de usuarios en el selector
 * @param {boolean} disabled
 * @param {string|null} usuarioActual
 */
async function cargarUsuariosSelect(disabled = false, usuarioActual = null) {
  try {
    const usuarios = await fetchJSON(API_USUARIOS_BASIC);
    const usuarioSelect = inputs.realizado_por;
    usuarioSelect.textContent = "";

    usuarioSelect.append(new Option("Seleccionar empleado...", ""));

    usuarios.forEach((u) => {
      usuarioSelect.append(
        new Option(`${u.user_id} - ${u.nombre} ${u.apellidos}`, u.user_id)
      );
    });

    usuarioSelect.disabled = disabled;
    if (usuarioActual) usuarioSelect.value = usuarioActual;
  } catch (err) {
    alert("Error cargando usuarios: " + err.message);
  }
}

// ============================================================================
//  PINTAR MANTENIMIENTOS EN TABLA
// ============================================================================

/**
 * @function cargarMantenimientos
 * @async
 * @description Carga mantenimientos desde backend y los muestra en tabla
 */
async function cargarMantenimientos() {
  try {
    const mantenimientos = await fetchJSON(API_MANTENIMIENTOS);

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    mantenimientos.forEach((m) => {
      const row = document.createElement("tr");

      const fechaInicioFmt = m.fecha_inicio
        ? new Date(m.fecha_inicio).toLocaleDateString("es-ES")
        : "";
      const fechaFinFmt = m.fecha_fin
        ? new Date(m.fecha_fin).toLocaleDateString("es-ES")
        : "";
      const creadoFmt = m.creado_at
        ? new Date(m.creado_at).toLocaleDateString("es-ES")
        : "";
      const costeFmt =
        m.coste != null
          ? new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(m.coste)
          : "";

      [
        m.mantenimiento_id,
        m.vehiculo_id,
        fechaInicioFmt,
        fechaFinFmt,
        m.descripcion,
        m.realizado_por,
        costeFmt,
        creadoFmt,
      ].forEach((valor) => {
        row.appendChild(
          Object.assign(document.createElement("td"), { textContent: valor })
        );
      });

      const accionesTd = document.createElement("td");
      accionesTd.innerHTML = `
        <button class="btn-editar" data-id="${m.mantenimiento_id}">Editar</button>
        <button class="btn-eliminar" data-id="${m.mantenimiento_id}">Eliminar</button>
      `;
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    alert("Error cargando mantenimientos: " + err.message);
  }
}

// ============================================================================
//  EDITAR MANTENIMIENTO
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;
    form.dataset.modo = "editar";
    formTitle.textContent = "Editar mantenimiento";

    try {
      const m = await fetchJSON(`${API_MANTENIMIENTOS}/${id}`);

      await cargarVehiculosSelect(true, m.vehiculo_id);
      await cargarUsuariosSelect(false, m.realizado_por);

      inputs.id.value = m.mantenimiento_id;
      inputs.vehiculo_id.value = m.vehiculo_id;
      inputs.fecha_inicio.value = m.fecha_inicio
        ? m.fecha_inicio.split("T")[0]
        : "";
      inputs.fecha_fin.value = m.fecha_fin ? m.fecha_fin.split("T")[0] : "";
      inputs.descripcion.value = m.descripcion;
      inputs.realizado_por.value = m.realizado_por;
      inputs.coste.value = m.coste;
      inputs.creado_at.value = m.creado_at ? m.creado_at.split("T")[0] : "";

      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      abrirModalFn();
    } catch (err) {
      alert("Error cargando mantenimiento: " + err.message);
    }
  }
});

// ============================================================================
//  ELIMINAR MANTENIMIENTO
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (!confirm("¿Seguro que deseas eliminar este mantenimiento?")) return;

    try {
      await fetchJSON(`${API_MANTENIMIENTOS}/${id}`, { method: "DELETE" });
      alert("Mantenimiento eliminado correctamente");
      cargarMantenimientos();
    } catch (err) {
      alert(err.message);
    }
  }
});

// ============================================================================
//  SUBMIT — CREAR / EDITAR
// ============================================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mantenimiento = {
    vehiculo_id: inputs.vehiculo_id.value,
    fecha_inicio: inputs.fecha_inicio.value,
    fecha_fin: inputs.fecha_fin.value || null,
    descripcion: inputs.descripcion.value,
    realizado_por: inputs.realizado_por.value,
    coste: inputs.coste.value || null,
  };

  let url = API_MANTENIMIENTOS;
  let metodo = "POST";

  if (form.dataset.modo === "editar") {
    metodo = "PUT";
    url = `${API_MANTENIMIENTOS}/${inputs.id.value}`;
  } else {
    mantenimiento.mantenimiento_id = inputs.id.value;
  }

  try {
    const data = await fetchJSON(url, {
      method: metodo,
      body: JSON.stringify(mantenimiento),
    });

    alert(data.mensaje || "Mantenimiento guardado correctamente");
    cerrarModalFn();
    cargarMantenimientos();
  } catch (err) {
    alert(err.message);
  }
});

// ============================================================================
//  INICIALIZACIÓN
// ============================================================================

window.addEventListener("DOMContentLoaded", cargarMantenimientos);
