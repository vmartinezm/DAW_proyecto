/**
 * @file clientes.js
 * @description Gestión frontend del módulo de clientes.
 */

import { requireAdmin, authFetch } from "./auth.js";

// API ENDPOINT
const API_USUARIOS = "http://localhost:3000/usuarios";

// ============================================================================
//  PROTECCIÓN DE ACCESO
// ============================================================================

if (!requireAdmin()) {
  throw new Error("Acceso denegado");
}


// ============================================================================
//  UTILIDAD FETCHJSON — UNIFICACIÓN MANEJO RESPUESTAS
// ============================================================================

/**
 * Wrapper general para fetch + JSON con control de errores
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 * @throws {Error} Si la respuesta backend indica error
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
    throw new Error(data.error || "Error en la operación");
  }

  return data;
}


// ============================================================================
//  REFERENCIAS DOM
// ============================================================================

const tableBody = document.querySelector("#usuariosTable tbody");
const btnAddUsuario = document.getElementById("btnAddUsuario");
const btnIrDashboard = document.getElementById("btnIrDashboard");

const modal = document.getElementById("usuariosModal");
const cerrarModal = document.getElementById("cerrarModal");
const btnCancelar = document.getElementById("btnCancelar");

const form = document.getElementById("usuariosForm");
const formTitle = document.getElementById("formTitle");
const grupoCreado = document.getElementById("grupoCreado");
const grupoPassword = document.getElementById("grupoPassword");


// ============================================================================
//  INPUTS
// ============================================================================
const inputs = {
  id: document.getElementById("user_id"),
  nombre: document.getElementById("nombre"),
  apellidos: document.getElementById("apellidos"),
  usuario: document.getElementById("usuario"),
  rol: document.getElementById("rol"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  creado_at: document.getElementById("creado_at"),
};


// ============================================================================
//  MODAL
// ============================================================================

/** Abre modal usuario */
const abrirModalFn = () => modal.style.display = "block";

/** Cierra modal usuario */
const cerrarModalFn = () => {
  modal.style.display = "none";
  form.reset();
};

cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});


// ============================================================================
//  NAVEGACIÓN
// ============================================================================
btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});


// ============================================================================
//  NUEVO USUARIO
// ============================================================================

btnAddUsuario.addEventListener("click", () => {
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo usuario";

  inputs.id.value = "";
  inputs.nombre.value = "";
  inputs.apellidos.value = "";
  inputs.usuario.value = "";
  inputs.email.value = "";
  inputs.rol.value = "empleado";

  inputs.password.value = "";
  inputs.password.placeholder = "Obligatorio para nuevo usuario";

  grupoPassword.style.display = "block";
  grupoCreado.style.display = "none";

  abrirModalFn();
});


// ============================================================================
//  CARGAR USUARIOS
// ============================================================================

/**
 * Obtiene la lista de usuarios y la muestra en tabla
 */
async function cargarUsuarios() {
  try {
    const usuarios = await fetchJSON(API_USUARIOS);

    tableBody.textContent = "";
    const frag = document.createDocumentFragment();

    usuarios.forEach((u) => {
      const row = document.createElement("tr");

      const creadoFmt = u.creado_at
        ? new Date(u.creado_at).toLocaleDateString("es-ES")
        : "";

      [
        u.user_id,
        u.nombre,
        u.apellidos,
        u.usuario,
        u.rol,
        u.email,
        creadoFmt
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      const acciones = document.createElement("td");
      acciones.innerHTML = `
        <button class="btn-editar" data-id="${u.user_id}">Editar</button>
        <button class="btn-eliminar" data-id="${u.user_id}">Eliminar</button>
      `;

      row.appendChild(acciones);
      frag.appendChild(row);
    });

    tableBody.appendChild(frag);

  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    alert(err.message);
  }
}


// ============================================================================
//  EDITAR
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("btn-editar")) return;

  const id = e.target.dataset.id;

  try {
    const usuario = await fetchJSON(`${API_USUARIOS}/${id}`);

    form.dataset.modo = "editar";
    formTitle.textContent = "Editar usuario";

    inputs.id.value = usuario.user_id;
    inputs.nombre.value = usuario.nombre;
    inputs.apellidos.value = usuario.apellidos;
    inputs.usuario.value = usuario.usuario;
    inputs.rol.value = usuario.rol;
    inputs.email.value = usuario.email;
    inputs.creado_at.value = usuario.creado_at ? usuario.creado_at.split("T")[0] : "";

    inputs.creado_at.disabled = true;
    grupoCreado.style.display = "block";
    grupoPassword.style.display = "block";

    inputs.password.placeholder = "Vacío → mantener contraseña actual";

    abrirModalFn();

  } catch (err) {
    console.error("Error al cargar usuario para edición:", err);
    alert(err.message);
  }
});


// ============================================================================
//  ELIMINAR
// ============================================================================

tableBody.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("btn-eliminar")) return;

  const id = e.target.dataset.id;
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    const data = await fetchJSON(`${API_USUARIOS}/${id}`, { method: "DELETE" });

    alert(data.mensaje || "Usuario eliminado correctamente");
    cargarUsuarios();

  } catch (err) {
    console.error("Error eliminando usuario:", err);
    alert(err.message);
  }
});


// ============================================================================
//  GUARDAR
// ============================================================================

/**
 * Envía datos al backend para crear o actualizar usuario
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    nombre: inputs.nombre.value.trim(),
    apellidos: inputs.apellidos.value.trim(),
    usuario: inputs.usuario.value.trim(),
    email: inputs.email.value.trim(),
    rol: inputs.rol.value,
  };

  // contraseña solo si se escribe
  if (inputs.password.value.trim() !== "") {
    datos.password = inputs.password.value.trim();
  }

  let url = API_USUARIOS;
  let method = "POST";

  if (form.dataset.modo === "editar") {
    method = "PUT";
    url = `${API_USUARIOS}/${inputs.id.value}`;
  }

  try {
    const data = await fetchJSON(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    alert(data.mensaje || "Usuario guardado correctamente");
    cerrarModalFn();
    cargarUsuarios();

  } catch (err) {
    console.error("Error al guardar usuario:", err);
    alert(err.message);
  }
});


// ============================================================================
//  INICIO
// ============================================================================
window.addEventListener("DOMContentLoaded", cargarUsuarios);