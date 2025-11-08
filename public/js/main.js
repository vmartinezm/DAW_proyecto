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
  id: document.getElementById("vehiculoId"),
  marca: document.getElementById("marca"),
  modelo: document.getElementById("modelo"),
  version: document.getElementById("version"),
  matricula: document.getElementById("matricula"),
  color: document.getElementById("color"),
  ano: document.getElementById("ano"),
  kilometros: document.getElementById("kilometros"),
  combustible: document.getElementById("combustible"),
  precio: document.getElementById("precio"),
  estado: document.getElementById("estado"),
};

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

    tableBody.innerHTML = "";

    function formatearNumero(num) {
      if (num === null || num === undefined) return "";
      return num.toLocaleString("es-ES"); // 👉 separador de miles según formato español
    }

    data.forEach((v) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${v.id}</td>
  <td>${v.marca}</td>
  <td>${v.modelo}</td>
  <td>${v.version ?? ""}</td>
  <td>${v.matricula}</td>
  <td>${v.color ?? ""}</td>
  <td>${v.ano ?? ""}</td>
  <td>${formatearNumero(v.kilometros)}</td>
  <td>${v.combustible ?? ""}</td>
  <td>${formatearNumero(v.precio)}</td>
  <td>${v.estado ?? ""}</td>
        <td>
          <button class="btn-editar" data-id="${v.id}">Editar</button>
          <button class="btn-eliminar" data-id="${v.id}">Eliminar</button>
        </td>
      `;

      row
        .querySelector(".btn-editar")
        .addEventListener("click", () => editarVehiculo(v));
      row
        .querySelector(".btn-eliminar")
        .addEventListener("click", () => eliminarVehiculo(v.id));

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
}

// ---------- Añadir o editar ----------
btnAddVehiculo.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo vehículo";
  abrirModal();
});

function editarVehiculo(v) {
  formTitle.textContent = "Editar vehículo";
  Object.keys(inputs).forEach((k) => (inputs[k].value = v[k] ?? ""));
  abrirModal();
}

function resetFormulario() {
  vehiculoForm.reset();
  inputs.id.value = "";
}

// ---------- Guardar (POST / PUT) ----------
vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    marca: inputs.marca.value.trim(),
    modelo: inputs.modelo.value.trim(),
    version: inputs.version.value.trim(),
    matricula: inputs.matricula.value.trim(),
    color: inputs.color.value.trim(),
    ano: parseInt(inputs.ano.value) || null,
    kilometros: parseInt(inputs.kilometros.value) || null,
    combustible: inputs.combustible.value,
    precio: parseFloat(inputs.precio.value) || null,
    estado: inputs.estado.value,
  };

  try {
    const id = inputs.id.value;
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

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

// ---------- Eliminar ----------
async function eliminarVehiculo(id) {
  if (!confirm("¿Seguro que quieres eliminar este vehículo?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Error al eliminar vehículo");
    cargarVehiculos();
  } catch (err) {
    console.error("Error al eliminar vehículo:", err);
  }
}

window.addEventListener("DOMContentLoaded", cargarVehiculos);
