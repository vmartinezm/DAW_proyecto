/**
 * Endpoint base para operaciones CRUD de clientes
 * @constant {string}
 */
const API_CLIENTES = "http://localhost:3000/clientes";

// ====== REFERENCIAS ======
/**
 * Referencias a elementos clave del DOM usados en esta vista
 */
const tableBody = document.querySelector("#clientesTable tbody");
const btnAddCliente = document.getElementById("btnAddCliente");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("clientesModal");
const cerrarModal = document.getElementById("cerrarModal");
const form = document.getElementById("clientesForm");
const formTitle = document.getElementById("formTitle");
const grupoCreado = document.getElementById("grupoCreado");
const btnCancelar = document.getElementById("btnCancelar");

// =====================================================
// INPUTS DEL FORMULARIO
// =====================================================
/**
 * Mapa de referencias a los inputs del formulario de cliente
 * @typedef {Object} ClienteInputs
 * @property {HTMLInputElement} dni
 * @property {HTMLInputElement} nombre
 * @property {HTMLInputElement} apellidos
 * @property {HTMLInputElement} email
 * @property {HTMLInputElement} telefono
 * @property {HTMLInputElement} direccion
 * @property {HTMLInputElement} creado_at
 */

/** @type {ClienteInputs} */
const inputs = {
  dni: document.getElementById("dni"),
  nombre: document.getElementById("nombre"),
  apellidos: document.getElementById("apellidos"),
  email: document.getElementById("email"),
  telefono: document.getElementById("telefono"),
  direccion: document.getElementById("direccion"),
  creado_at: document.getElementById("creado_at"),
};

// =====================================================
// LIMPIAR FORMULARIO
// =====================================================

/**
 * Restablece el formulario y prepara para modo CREAR
 * Elimina valores previos y desbloquea campos
 */
function limpiarFormulario() {
  form.reset();
  form.dataset.modo = "crear";

  inputs.dni.disabled = false;
  inputs.creado_at.disabled = true;
  grupoCreado.style.display = "none";
}

// =====================================================
// ABRIR / CERRAR MODAL
// =====================================================

/** Muestra modal */
const abrirModalFn = () => {
  modal.style.display = "block";
};

/** Oculta modal y resetea formulario */
const cerrarModalFn = () => {
  modal.style.display = "none";
  limpiarFormulario();
};

cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// =====================================================
// NAVEGACION
// =====================================================

btnVolverVehiculos.addEventListener("click", () => {
  window.location.href = "vehiculos.html";
});

btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});

// =====================================================
// AÑADIR NUEVO CLIENTE
// =====================================================

btnAddCliente.addEventListener("click", () => {
  limpiarFormulario();
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo cliente";
  abrirModalFn();
});

// =====================================================
// CARGAR CLIENTES EN TABLA
// =====================================================

/**
 * Obtiene todos los clientes y los renderiza en la tabla HTML
 */
async function cargarClientes() {
  try {
    const res = await fetch(API_CLIENTES);
    if (!res.ok) throw new Error("Error al obtener clientes");

    const clientes = await res.json();
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

      // acciones
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
    console.error("Error al cargar clientes:", err);
  }
}

// =====================================================
// EDITAR CLIENTE
// =====================================================

/**
 * Listener para eventos del botón editar en la tabla
 */
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    limpiarFormulario();

    form.dataset.modo = "editar";
    formTitle.textContent = "Editar cliente";

    try {
      const res = await fetch(`${API_CLIENTES}/${id}`);
      const cliente = await res.json();

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
      console.error("Error al cargar cliente para edición:", err);
    }
  }
});

// =====================================================
// GUARDAR CLIENTE (CREATE / UPDATE)
// =====================================================

/**
 * Maneja el submit del formulario de cliente
 * Decide si crea nuevo o actualiza existente
 */
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
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al guardar");
      return;
    }

    alert(data.mensaje || "Cliente guardado");
    cerrarModalFn();
    cargarClientes();
  } catch (err) {
    console.error("Error al guardar cliente:", err);
  }
});

// =====================================================
// ELIMINAR CLIENTE
// =====================================================

/**
 * Listener del botón eliminar dentro de la tabla de clientes
 */
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;

    if (confirm("¿Seguro que quieres eliminar este cliente?")) {
      try {
        const res = await fetch(`${API_CLIENTES}/${id}`, { method: "DELETE" });
        const data = await res.json();

        alert(data.mensaje || "Cliente eliminado");
        cargarClientes();
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
      }
    }
  }
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

/**
 * Carga inicial al entrar en la vista
 */
window.addEventListener("DOMContentLoaded", cargarClientes);