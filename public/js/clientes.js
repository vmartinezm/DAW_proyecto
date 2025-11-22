const API_CLIENTES = "http://localhost:3000/clientes";

// Referencias
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

// -------------------------
// 🔵 Función de limpieza total
// -------------------------
function limpiarFormulario() {
  form.reset();
  form.dataset.modo = "crear";

  // Inputs siempre habilitados excepto creado_at
  inputs.dni.disabled = false;
  inputs.creado_at.disabled = true;

  // Ocultar grupo creado
  grupoCreado.style.display = "none";
}

// -------------------------
// 🔵 Abrir y cerrar modal
// -------------------------
const abrirModalFn = () => {
  modal.style.display = "block";
};

const cerrarModalFn = () => {
  modal.style.display = "none";
  limpiarFormulario();
};

cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// -------------------------
// 🔵 Volver a vehículos
// -------------------------
btnVolverVehiculos.addEventListener("click", () => {
  window.location.href = "vehiculos.html";
});

// -------------------------
// 🔵 Ir a dashboard
// -------------------------
btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});

// -------------------------
// 🟢 Botón Añadir Cliente
// -------------------------
btnAddCliente.addEventListener("click", () => {
  limpiarFormulario();
  form.dataset.modo = "crear";
  formTitle.textContent = "Añadir nuevo cliente";

  abrirModalFn();
});

// -------------------------
// 🟡 Cargar clientes
// -------------------------
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

// -------------------------
// 🟡 Editar cliente
// -------------------------
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    limpiarFormulario(); // <- evita arrastrar estados previos

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

      // DNI no editable
      inputs.dni.disabled = true;

      // Mostrar creado_at pero deshabilitado
      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar cliente para edición:", err);
    }
  }
});

// -------------------------
// 🟢 Enviar formulario
// -------------------------
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

// -------------------------
// 🔴 Eliminar cliente
// -------------------------
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

// -------------------------
// Inicializar
// -------------------------
window.addEventListener("DOMContentLoaded", cargarClientes);