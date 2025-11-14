const API_USUARIOS = "http://localhost:3000/usuarios";

// Referencias
const tableBody = document.querySelector("#usuariosTable tbody");
const btnAddVenta = document.getElementById("btnAddUsuario");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const modal = document.getElementById("usuariosModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs del formulario
const inputs = {
  id: document.getElementById("user_id"),
  nombre: document.getElementById("nombre"),
  apellidos: document.getElementById("apellidos"),
  usuario: document.getElementById("usuario"),
  rol: document.getElementById("rol"),
  email: document.getElementById("email"),
  //password_hash: document.getElementById('password_hash'),
  creado_at: document.getElementById("creado_at"),
};

// Función para abrir el modal
const abrirModalFn = () => {
  modal.style.display = "block";
};

// Función para cerrar el modal
const cerrarModalFn = () => {
  modal.style.display = "none";
};

cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// ---------- Volver a la página de vehículos ----------
document.getElementById("btnVolverVehiculos").addEventListener("click", () => {
  window.location.href = "index.html";
});

// ---------- Abrir modal para añadir ----------
btnAddUsuario.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo usuario";

  // Ocultar campo "Creado" al crear
  grupoCreado.style.display = "none";
  inputs.creado_at.value = "";

  abrirModalFn();
});

// ---------- Cancelar ----------
btnCancelar.addEventListener("click", cerrarModalFn);

async function cargarUsuarios() {
  try {
    const res = await fetch(API_USUARIOS);
    if (!res.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await res.json();

    // Limpiar la tabla
    tableBody.textContent = "";

    const fragment = document.createDocumentFragment();

    usuarios.forEach((u) => {
      const row = document.createElement("tr");

      const creadoFmt = u.creado_at
        ? new Date(u.creado_at).toLocaleDateString("es-ES")
        : "";

      // Celdas de datos
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

      // Celda de acciones
      const tdAcciones = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.dataset.id = u.user_id;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = u.user_id;

      tdAcciones.append(btnEditar, btnEliminar);
      row.appendChild(tdAcciones);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);

  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}

// ---------- Inicializar ----------
window.addEventListener("DOMContentLoaded", cargarUsuarios);
