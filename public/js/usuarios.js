import { requireAdmin } from "./auth.js";

/**
 * Endpoint del API para la gestión de usuarios
 * @constant {string}
 */
const API_USUARIOS = "http://localhost:3000/usuarios";

/**
 * Control de acceso: solo administradores pueden acceder a la página
 * requireAdmin() ya redirige a login o dashboard si no es admin
 */
if (!requireAdmin()) {
  throw new Error("Acceso denegado");
}

// =========================================================
//                 REFERENCIAS A ELEMENTOS DOM
// =========================================================

/** @type {HTMLElement} */
const tableBody = document.querySelector("#usuariosTable tbody");
/** @type {HTMLButtonElement} */
const btnAddUsuario = document.getElementById("btnAddUsuario");
/** @type {HTMLButtonElement} */
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
/** @type {HTMLButtonElement} */
const btnIrDashboard = document.getElementById("btnIrDashboard");
/** @type {HTMLElement} */
const modal = document.getElementById("usuariosModal");
/** @type {HTMLElement} */
const cerrarModal = document.getElementById("cerrarModal");
/** @type {HTMLFormElement} */
const form = document.getElementById("usuariosForm");
/** @type {HTMLElement} */
const formTitle = document.getElementById("formTitle");
/** @type {HTMLElement} */
const grupoCreado = document.getElementById("grupoCreado");
/** @type {HTMLElement} */
const grupoPassword = document.getElementById("grupoPassword");
/** @type {HTMLButtonElement} */
const btnCancelar = document.getElementById("btnCancelar");

// =========================================================
//                 INPUTS DEL FORMULARIO
// =========================================================

/**
 * Referencias a los campos del formulario de usuario
 * @typedef {Object} UsuarioInputs
 * @property {HTMLInputElement} id
 * @property {HTMLInputElement} nombre
 * @property {HTMLInputElement} apellidos
 * @property {HTMLInputElement} usuario
 * @property {HTMLInputElement} rol
 * @property {HTMLInputElement} email
 * @property {HTMLInputElement} password
 * @property {HTMLInputElement} creado_at
 */

/** @type {UsuarioInputs} */
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

// =========================================================
//                  MODAL FUNCTIONS
// =========================================================

/** Abre modal */
const abrirModalFn = () => {
  modal.style.display = "block";
};

/** Cierra modal */
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos de cierre
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// =========================================================
//                  NAVEGACIÓN
// =========================================================

btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});

// =========================================================
//               NUEVO USUARIO (modo CREAR)
// =========================================================

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
  inputs.password.placeholder = "Obligatorio crear contraseña al crear nuevo usuario";

  grupoPassword.style.display = "block";
  grupoCreado.style.display = "none";
  inputs.creado_at.value = "";

  abrirModalFn();
});

// =========================================================
//                CARGAR USUARIOS EN TABLA
// =========================================================

/**
 * Obtiene lista de usuarios del backend y los muestra en tabla HTML
 */
async function cargarUsuarios() {
  try {
    const res = await fetch(API_USUARIOS);
    if (!res.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await res.json();

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    usuarios.forEach((u) => {
      const row = document.createElement("tr");

      const creadoFmt = u.creado_at
        ? new Date(u.creado_at).toLocaleDateString("es-ES")
        : "";

      const columnas = [
        u.user_id,
        u.nombre,
        u.apellidos,
        u.usuario,
        u.rol,
        u.email,
        creadoFmt,
      ];

      columnas.forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      // Celda acciones
      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.dataset.id = u.user_id;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = u.user_id;

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}

// =========================================================
//                        EDITAR USUARIO
// =========================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {

    const id = e.target.dataset.id;
    form.dataset.modo = "editar";
    formTitle.textContent = "Editar usuario";

    try {
      const res = await fetch(`${API_USUARIOS}/${id}`);
      const usuario = await res.json();

      form.reset();

      inputs.id.value = usuario.user_id;
      inputs.nombre.value = usuario.nombre;
      inputs.apellidos.value = usuario.apellidos;
      inputs.usuario.value = usuario.usuario;
      inputs.rol.value = usuario.rol;
      inputs.email.value = usuario.email;
      inputs.creado_at.value = usuario.creado_at
        ? usuario.creado_at.split("T")[0]
        : "";

      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      // Contraseña opcional en modo edición
      grupoPassword.style.display = "block";
      inputs.password.value = "";
      inputs.password.placeholder = "Dejar vacío para mantener contraseña actual";

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar usuario para edición:", err);
    }
  }
});

// =========================================================
//                      ELIMINAR USUARIO
// =========================================================

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {

    const id = e.target.dataset.id;

    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        const res = await fetch(`${API_USUARIOS}/${id}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.mensaje || "Usuario eliminado");
        cargarUsuarios();
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
      }
    }
  }
});

// =========================================================
//                        GUARDAR USUARIO
// =========================================================

/**
 * Maneja envío del formulario creando o actualizando usuario según modo
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    nombre: inputs.nombre.value,
    apellidos: inputs.apellidos.value,
    usuario: inputs.usuario.value,
    rol: inputs.rol.value,
    email: inputs.email.value,
  };

  // Contraseña solo si se escribe algo
  if (inputs.password.value.trim() !== "") {
    datos.password = inputs.password.value.trim();
  }

  let url = API_USUARIOS;
  let metodo = "POST";

  if (form.dataset.modo === "editar") {
    metodo = "PUT";
    url = `${API_USUARIOS}/${inputs.id.value}`;
  }

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(data.mensaje || "Usuario guardado");

    cerrarModalFn();
    cargarUsuarios();

  } catch (err) {
    console.error("Error al guardar usuario:", err);
  }
});

// =========================================================
//                  INICIALIZACIÓN
// =========================================================

window.addEventListener("DOMContentLoaded", cargarUsuarios);