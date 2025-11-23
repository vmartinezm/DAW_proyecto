// ====== API ENDPOINTS ======
/**
 * @constant {string} API_MANTENIMIENTOS URL para operaciones CRUD de mantenimientos
 */
const API_MANTENIMIENTOS = "http://localhost:3000/mantenimientos";
/**
 * @constant {string} API_VEHICULOS URL de consulta de vehículos
 */
const API_VEHICULOS = "http://localhost:3000/vehiculos";
/**
 * @constant {string} API_USUARIOS URL de consulta de usuarios (empleados)
 */
const API_USUARIOS = "http://localhost:3000/usuarios";


// ====== REFERENCIAS ======
/**
 * Elementos principales de la interfaz
 */
const tableBody = document.querySelector("#mantenimientosTable tbody");
const btnAddMantenimiento = document.getElementById("btnAddMantenimiento");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrDashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("mantenimientoModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnCancelar = document.getElementById("btnCancelar");
const grupoCreado = document.getElementById("grupoCreado");
const form = document.getElementById("mantenimientoForm");

// Inputs del formulario
const inputs = {
    id: document.getElementById("mantenimiento_id"),
    vehiculo_id: document.getElementById("vehiculo_id"),
    fecha_inicio: document.getElementById("fecha_inicio"),
    fecha_fin: document.getElementById("fecha_fin"),
    descripcion: document.getElementById("descripcion"),
    realizado_por: document.getElementById("realizado_por"),
    coste: document.getElementById("coste"),
    creado_at: document.getElementById("creado_at"),
};


// ====== FUNCIONES DE MODAL ======

/**
 * Abre el modal del formulario
 */
const abrirModalFn = () => {
  modal.style.display = "block";
};

/**
 * Cierra el modal
 */
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos modal
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});


// ====== NAVEGACIÓN ======
btnVolverVehiculos.addEventListener("click", () => {
  window.location.href = "vehiculos.html";
});

btnIrDashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});


// ====== ABRIR MODAL PARA AÑADIR ======
btnAddMantenimiento.addEventListener("click", async () => {
  formTitle.textContent = "Añadir nuevo mantenimiento";
  form.dataset.modo = "crear";

  // Limpiar datos previos del formulario
  inputs.id.value = "";
  inputs.vehiculo_id.value = "";
  inputs.fecha_inicio.value = "";
  inputs.fecha_fin.value = "";
  inputs.descripcion.value = "";
  inputs.realizado_por.value = "";
  inputs.coste.value = "";
  inputs.creado_at.value = "";

  // Cargar desplegables
  await cargarVehiculosSelect(false);
  await cargarUsuariosSelect(false);

  grupoCreado.style.display = "none";

  abrirModalFn();
});


// ====== CARGAR VEHÍCULOS EN SELECT ======

/**
 * Rellena el select de vehículos permitiendo escoger
 * solo vehículos disponibles (excepto en edición).
 *
 * @param {boolean} disabled si true el select queda bloqueado (modo edición)
 * @param {string|null} vehiculoActual matrícula permitida aunque no esté disponible
 */
async function cargarVehiculosSelect(disabled = false, vehiculoActual = null) {
  try {
    const res = await fetch(API_VEHICULOS);
    const vehiculos = await res.json();

    const vehiculoSelect = inputs.vehiculo_id;
    vehiculoSelect.textContent = "";

    // Opción por defecto
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar vehículo...";
    vehiculoSelect.appendChild(defaultOption);

    vehiculos.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.matricula;
      option.textContent = `${v.matricula} - ${v.marca} ${v.modelo} (${v.estado})`;

      // Bloquear vehículos vendidos / reservados / mantenimiento
      if (v.estado !== "disponible" && v.matricula !== vehiculoActual) {
        option.disabled = true;
        option.style.color = "#9ca3af";
        option.style.fontStyle = "italic";
      }

      vehiculoSelect.appendChild(option);
    });

    vehiculoSelect.disabled = disabled;
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
}


// ====== CARGAR USUARIOS EN SELECT ======

/**
 * Rellena el select de empleados
 *
 * @param {boolean} disabled si true el campo queda bloqueado
 * @param {string|null} vendedorActual id del usuario actual (en edición)
 */
async function cargarUsuariosSelect(disabled = false, vendedorActual = null) {
  try {
    const res = await fetch(API_USUARIOS);
    const usuarios = await res.json();

    const usuarioSelect = inputs.realizado_por;
    usuarioSelect.textContent = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar vendedor...";
    usuarioSelect.appendChild(defaultOption);

    usuarios.forEach((u) => {
      const option = document.createElement("option");
      option.value = u.user_id;
      option.textContent = `${u.user_id} - ${u.nombre} ${u.apellidos}`;
      usuarioSelect.appendChild(option);
    });

    usuarioSelect.disabled = disabled;
    if (vendedorActual) usuarioSelect.value = vendedorActual;
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}


// ====== CARGAR MANTENIMIENTOS EN TABLA ======

/**
 * Obtiene la lista de mantenimientos del backend y los pinta en la tabla.
 */
async function cargarMantenimientos() {
  try {
    const res = await fetch(API_MANTENIMIENTOS);
    const mantenimientos = await res.json();

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    mantenimientos.forEach((m) => {
      const row = document.createElement("tr");

      const fechaInicioFmt = m.fecha_inicio
        ? new Date(m.fecha_inicio).toLocaleDateString("es-ES")
        : "";

      const fechaFinFmt = m.fecha_fin
        ? new Date(m.fecha_fin).toLocaleDateString("es-ES")
        : "";

      const creadoFmt = m.creado_at
        ? new Date(m.creado_at).toLocaleDateString("es-ES")
        : "";

      const costeFmt = m.coste != null
        ? new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(m.coste)
        : "";

      [
        m.mantenimiento_id,
        m.vehiculo_id,
        fechaInicioFmt,
        fechaFinFmt,
        m.descripcion,
        m.realizado_por,
        costeFmt,
        creadoFmt
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });

      // Acciones
      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.dataset.id = m.mantenimiento_id;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = m.mantenimiento_id;

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar mantenimientos:", err);
  }
}


// ====== EDITAR REGISTRO ======
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    form.dataset.modo = "editar";
    formTitle.textContent = "Editar mantenimiento";

    try {
      const res = await fetch(`${API_MANTENIMIENTOS}/${id}`);
      const mantenimiento = await res.json();

      await cargarVehiculosSelect(true, mantenimiento.vehiculo_id);
      await cargarUsuariosSelect(false, mantenimiento.realizado_por);
      console.log("realizado_por:", mantenimiento.realizado_por);

      inputs.id.value = mantenimiento.mantenimiento_id;
      inputs.vehiculo_id.value = mantenimiento.vehiculo_id;

      inputs.fecha_inicio.value = mantenimiento.fecha_inicio
        ? mantenimiento.fecha_inicio.split("T")[0]
        : "";

      inputs.fecha_fin.value = mantenimiento.fecha_fin
        ? mantenimiento.fecha_fin.split("T")[0]
        : "";

      inputs.descripcion.value = mantenimiento.descripcion;
      inputs.realizado_por.value = mantenimiento.realizado_por;
      inputs.coste.value = mantenimiento.coste;

      inputs.creado_at.value = mantenimiento.creado_at
        ? mantenimiento.creado_at.split("T")[0]
        : "";

      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar mantenimiento:", err);
    }
  }
});


// ====== ELIMINAR REGISTRO ======
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;

    if (confirm("¿Seguro que deseas eliminar este mantenimiento?")) {
      try {
        const res = await fetch(`${API_MANTENIMIENTOS}/${id}`, { method: "DELETE" });
        const data = await res.json();

        alert(data.mensaje || "Mantenimiento eliminado");
        cargarMantenimientos();
      } catch (err) {
        console.error("Error al eliminar mantenimiento:", err);
      }
    }
  }
});


// ====== SUBMIT FORM ======

/**
 * Envía cambios al backend tanto para crear como editar.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    vehiculo_id: inputs.vehiculo_id.value,
    fecha_inicio: inputs.fecha_inicio.value,
    fecha_fin: inputs.fecha_fin.value,
    descripcion: inputs.descripcion.value,
    realizado_por: inputs.realizado_por.value,
    coste: inputs.coste.value,
  };

  const modo = form.dataset.modo;
  let url = API_MANTENIMIENTOS;
  let metodo = "POST";

  if (modo === "editar") {
    metodo = "PUT";
    url = `${API_MANTENIMIENTOS}/${inputs.id.value}`;
  }

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();
    alert(data.mensaje || "Mantenimiento guardado");
    cerrarModalFn();
    cargarMantenimientos();
  } catch (err) {
    console.error("Error al guardar mantenimiento:", err);
  }
});


// ====== INICIALIZAR ======
window.addEventListener("DOMContentLoaded", cargarMantenimientos);