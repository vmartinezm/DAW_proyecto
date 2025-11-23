// API ENDPOINT
/**
 * @constant {string} API_VEHICULOS URL de vehículos
 */
const API_URL = "http://localhost:3000/vehiculos";

/**
 * Elementos principales de la interfaz
 */
const tableBody = document.querySelector("#vehiculosTable tbody");
const btnAddVehiculo = document.getElementById("btnAddVehiculo");
const modal = document.getElementById("vehiculoModal");
const cerrarModal = document.getElementById("cerrarModal");
const vehiculoForm = document.getElementById("vehiculoForm");
const formTitle = document.getElementById("form-title");
const btnCancelar = document.getElementById("btnCancelar");

// Inputs en el formulario
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

// Estado interno
let modoEdicion = false;


/**
 * Abre el modal del formulario.
 */
function abrirModal() {
  modal.style.display = "block";
}

/**
 * Cierra el modal y limpia el formulario.
 */
function cerrarModalFn() {
  modal.style.display = "none";
  resetFormulario();
}

// Eventos de cierre modal
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});


/**
 * Obtiene la lista de vehículos del backend y los pinta en la tabla.
 * @async
 */
async function cargarVehiculos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    tableBody.textContent = "";

    const fragment = document.createDocumentFragment();

    data.forEach((v) => {
      const row = document.createElement("tr");

      const precioFmt =
        v.precio != null
          ? new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(v.precio)
          : "";

      const kmFmt =
        v.kilometros != null
          ? new Intl.NumberFormat("es-ES", {
              style: "unit",
              unit: "kilometer",
              unitDisplay: "short",
            }).format(v.kilometros)
          : "";

      [
        v.matricula,
        v.marca,
        v.modelo,
        v.version ?? "",
        v.color ?? "",
        v.ano ?? "",
        kmFmt,
        v.combustible ?? "",
        precioFmt,
        v.estado ?? "",
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      // Celda acciones
      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarVehiculo(v));

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.addEventListener("click", () =>
        eliminarVehiculo(v.matricula)
      );

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
}


/**
 * Abre el formulario para crear un nuevo vehículo.
 */
btnAddVehiculo.addEventListener("click", () => {
  formTitle.textContent = "Añadir nuevo vehículo";
  abrirModal();
  resetFormulario();
  modoEdicion = false;
  inputs.matricula.disabled = false;
});


/**
 * Abre el formulario para editar un vehículo existente.
 * @param {Object} v - objeto con los datos del vehículo
 */
function editarVehiculo(v) {
  formTitle.textContent = "Editar vehículo";
  Object.keys(inputs).forEach((k) => (inputs[k].value = v[k] ?? ""));
  abrirModal();
  modoEdicion = true;
  inputs.matricula.disabled = true;
}


/**
 * Resetea el formulario y restablece estado de edición.
 */
function resetFormulario() {
  vehiculoForm.reset();
  inputs.matricula.disabled = false;
  modoEdicion = false;
}


/**
 * Envía los datos del formulario al backend para crear o editar.
 * @async
 * @param {SubmitEvent} e
 */
vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vehiculo = {
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
      method = "PUT";
      url = `${API_URL}/${inputs.matricula.value}`;
    } else {
      method = "POST";
      url = API_URL;
      vehiculo.matricula = inputs.matricula.value.trim();
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehiculo),
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


/**
 * Elimina un vehículo por matrícula.
 * @async
 * @param {string} matricula
 */
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


// ---- Navegación ----
const btnAddMantenimiento = document.getElementById("btnAddMantenimiento");
btnAddMantenimiento.addEventListener("click", () => {
  window.location.href = "mantenimientos.html";
});

const btnAddVenta = document.getElementById("btnAddVenta");
btnAddVenta.addEventListener("click", () => {
  window.location.href = "ventas.html";
});

const btnIrDashboard = document.getElementById("btnIrDashboard");
btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});


// Ejecutar carga inicial en DOM ready
window.addEventListener("DOMContentLoaded", cargarVehiculos);