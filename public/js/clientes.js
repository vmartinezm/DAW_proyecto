const API_CLIENTES = "http://localhost:3000/clientes";

// Referencias
const tableBody = document.querySelector("#clientesTable tbody");
const btnAddVenta = document.getElementById("btnAddCliente");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const modal = document.getElementById("clientesModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs del formulario
const inputs = {
  dni: document.getElementById("dni"),
  nombre: document.getElementById("nombre"),
  apellidos: document.getElementById("apellidos"),
  email: document.getElementById("email"),
  telefono: document.getElementById("telefono"),
  direccion: document.getElementById("direccion"),
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
btnAddCliente.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo cliente";

  // Ocultar campo "Creado" al crear
  grupoCreado.style.display = "none";
  inputs.creado_at.value = "";

  abrirModalFn();
});

// ---------- Cancelar ----------
btnCancelar.addEventListener("click", cerrarModalFn);

async function cargarClientes() {
  try {
    const res = await fetch(API_CLIENTES);
    if (!res.ok) throw new Error("Error al obtener clientes");

    const clientes = await res.json();

    // Limpiar la tabla
    tableBody.textContent = "";

    const fragment = document.createDocumentFragment();

    clientes.forEach((c) => {
      const row = document.createElement("tr");

      const creadoFmt = c.creado_at
        ? new Date(c.creado_at).toLocaleDateString("es-ES")
        : "";

      // Celdas de datos
      [
        c.dni,
        c.nombre,
        c.apellidos,
        c.email,
        c.telefono,
        c.direccion,
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
      btnEditar.dataset.id = c.dni;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = c.dni;

      tdAcciones.append(btnEditar, btnEliminar);
      row.appendChild(tdAcciones);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);

  } catch (err) {
    console.error("Error al cargar clienes:", err);
  }
}

// ---------- Inicializar ----------
window.addEventListener("DOMContentLoaded", cargarClientes);
