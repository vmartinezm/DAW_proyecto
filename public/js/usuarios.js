import { requireAdmin } from "./auth.js";

const API_USUARIOS = "http://localhost:3000/usuarios";

//Control de acceso
if (!requireAdmin()) {
  // Si el usuario no es admin, no ejecutamos nada más
  // La función ya redirige al dashboard/login
  throw new Error("Acceso denegado");
}

// Referencias
const tableBody = document.querySelector("#usuariosTable tbody");
const btnAddUsuario = document.getElementById("btnAddUsuario");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("usuariosModal");
const cerrarModal = document.getElementById("cerrarModal");
const form = document.getElementById("usuariosForm");
const formTitle = document.getElementById("formTitle");
const grupoCreado = document.getElementById("grupoCreado");
const grupoPassword = document.getElementById("grupoPassword");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs del formulario
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

// Abrir modal
const abrirModalFn = () => {
  modal.style.display = "block";
};

// Cerrar modal
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos de cierre
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);

window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// Ir a dashboard
btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ---------- Añadir usuario ----------
btnAddUsuario.addEventListener("click", () => {
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo usuario";

  // limpiar campos
  inputs.id.value = "";
  inputs.nombre.value = "";
  inputs.apellidos.value = "";
  inputs.usuario.value = "";
  inputs.email.value = "";
  inputs.rol.value = "empleado";

  inputs.password.value = "";
  inputs.password.placeholder = "Obligatorio crear contraseña al crear nuevo usuario";

  // mostrar campo contraseña
  grupoPassword.style.display = "block";

  // ocultar campo creado
  grupoCreado.style.display = "none";
  inputs.creado_at.value = "";

  abrirModalFn();
});

// =========================================================
//                  CARGAR USUARIOS EN TABLA
// =========================================================
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

      [
        u.user_id,
        u.nombre,
        u.apellidos,
        u.usuario,
        u.rol,
        u.email,
        creadoFmt,
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

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
//                        EDITAR
// =========================================================
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;
    form.dataset.modo = "editar";
    formTitle.textContent = "Editar usuario";

    try {
      const res = await fetch(`${API_USUARIOS}/${id}`);
      const usuario = await res.json();

      // Reset del formulario
      form.reset();

      // Rellenar campos
      inputs.id.value = usuario.user_id;
      inputs.nombre.value = usuario.nombre;
      inputs.apellidos.value = usuario.apellidos;
      inputs.usuario.value = usuario.usuario;
      inputs.rol.value = usuario.rol;
      inputs.email.value = usuario.email;
      inputs.creado_at.value = usuario.creado_at
        ? usuario.creado_at.split("T")[0]
        : "";

      // Mostrar bloque de fecha de creación
      grupoCreado.style.display = "block";

      // Hacer que el campo creado_at sea solo lectura
      inputs.creado_at.disabled = true;

      // En edición → contraseña opcional
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
//                      ELIMINAR
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
//                       GUARDAR
// =========================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    nombre: inputs.nombre.value,
    apellidos: inputs.apellidos.value,
    usuario: inputs.usuario.value,
    rol: inputs.rol.value,
    email: inputs.email.value,
  };

  // Solo enviamos contraseña si se proporciona
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
//                      INICIALIZAR
// =========================================================
window.addEventListener("DOMContentLoaded", cargarUsuarios);