const API_URL = "http://localhost:3000/vehiculos";

// Elementos principales
const tableBody = document.querySelector("#vehiculosTable tbody");
const btnAddVehiculo = document.getElementById("btnAddVehiculo");
const modal = document.getElementById("vehiculoModal");
const cerrarModal = document.getElementById("cerrarModal");
const vehiculoForm = document.getElementById("vehiculoForm");
const formTitle = document.getElementById("form-title");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs
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

// Variable para diferenciar añadir / editar
let modoEdicion = false;

// ---------- Modal helpers ----------
function abrirModal() {
  modal.style.display = "block";
}
function cerrarModalFn() {
  modal.style.display = "none";
  resetFormulario();
}
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});

// ---------- Cargar vehículos ----------
async function cargarVehiculos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    tableBody.textContent = ""; // Limpiar la tabla

    const formatearNumero = (num) =>
      num == null ? "" : num.toLocaleString("es-ES");

    const fragment = document.createDocumentFragment();

    data.forEach((v) => {
      const row = document.createElement("tr");

      // Crear celdas de datos
      [
        v.matricula,
        v.marca,
        v.modelo,
        v.version ?? "",
        v.color ?? "",
        v.ano ?? "",
        formatearNumero(v.kilometros),
        v.combustible ?? "",
        formatearNumero(v.precio),
        v.estado ?? "",
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      // Crear celda de acciones
      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarVehiculo(v));

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.addEventListener("click", () => eliminarVehiculo(v.matricula));

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
}

// ---------- Abrir modal para añadir ----------
btnAddVehiculo.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo vehículo";
  abrirModal();
  resetFormulario();
  modoEdicion = false;
  inputs.matricula.disabled = false; // La matrícula se puede introducir
});

// ---------- Abrir modal para editar ----------
function editarVehiculo(v) {
  formTitle.textContent = "Editar vehículo";
  Object.keys(inputs).forEach((k) => (inputs[k].value = v[k] ?? ""));
  abrirModal();
  modoEdicion = true;
  inputs.matricula.disabled = true; // La matrícula no se puede cambiar
}

// ---------- Reset formulario ----------
function resetFormulario() {
  vehiculoForm.reset();
  inputs.matricula.disabled = false;
  modoEdicion = false;
}

// ---------- Guardar vehículo ----------
vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
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

  try {
    let method, url;

    if (modoEdicion) {
      // Editar vehículo existente
      method = "PUT";
      url = `${API_URL}/${inputs.matricula.value}`;
    } else {
      // Añadir vehículo nuevo
      method = "POST";
      url = API_URL;
      payload.matricula = inputs.matricula.value.trim();
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al guardar vehículo");
      return;
    }

    cerrarModalFn();
    cargarVehiculos();
  } catch (err) {
    console.error("Error al guardar vehículo:", err);
  }
});

// ---------- Eliminar vehículo ----------
async function eliminarVehiculo(matricula) {
  if (!confirm("¿Seguro que quieres eliminar este vehículo?")) return;
  try {
    const res = await fetch(`${API_URL}/${matricula}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Error al eliminar vehículo");
    cargarVehiculos();
  } catch (err) {
    console.error("Error al eliminar vehículo:", err);
  }
}

// ---------- Ir a la página de mantenimientos ----------
const btnAddMantenimiento = document.getElementById('btnAddMantenimiento');
btnAddMantenimiento.addEventListener('click', () => {
  window.location.href = 'mantenimientos.html';
});

// ---------- Ir a la página de ventas ----------
const btnAddVenta = document.getElementById('btnAddVenta');
btnAddVenta.addEventListener('click', () => {
  window.location.href = 'ventas.html';
});

window.addEventListener("DOMContentLoaded", cargarVehiculos);