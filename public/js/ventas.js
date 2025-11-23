// ====== API ENDPOINTS ======
/**
 * @constant {string} API_VENTAS URL de API para CRUD de ventas
 */
const API_VENTAS = "http://localhost:3000/ventas";
/**
 * @constant {string} API_VEHICULOS URL de API para consulta de vehículos
 */
const API_VEHICULOS = "http://localhost:3000/vehiculos";
/**
 * @constant {string} API_CLIENTES URL de API para consulta de clientes
 */
const API_CLIENTES = "http://localhost:3000/clientes";
/**
 * @constant {string} API_USUARIOS URL de API para consulta de usuarios (vendedores)
 */
const API_USUARIOS = "http://localhost:3000/usuarios";


// ====== REFERENCIAS ======
/**
 * Referencias a elementos clave del DOM usados en esta vista
 */
const tableBody = document.querySelector("#ventasTable tbody");
const btnAddVenta = document.getElementById("btnAddVenta");
const btnVolverVehiculos = document.getElementById("btnVolverVehiculos");
const btnIrdashboard = document.getElementById("btnIrDashboard");
const modal = document.getElementById("ventaModal");
const cerrarModal = document.getElementById("cerrarModal");
const formTitle = document.getElementById("formTitle");
const btnCancelar = document.getElementById("btnCancelar");
const grupoCreado = document.getElementById("grupoCreado");
const form = document.getElementById("ventasForm");

// Inputs del formulario
/**
 * Objeto que almacena las referencias de cada input del formulario de venta
 */
const inputs = {
  id: document.getElementById("venta_id"),
  vehiculo_id: document.getElementById("vehiculo_id"),
  cliente_dni: document.getElementById("cliente_dni"),
  fecha: document.getElementById("fecha"),
  tipo: document.getElementById("tipo"),
  precio_venta: document.getElementById("precio_venta"),
  vendedor_id: document.getElementById("vendedor_id"),
  notas: document.getElementById("notas"),
  creado_at: document.getElementById("creado_at"),
};


// ====== FUNCIONES DE MODAL ======

/**
 * Abre el modal de formulario
 */
const abrirModalFn = () => {
  modal.style.display = "block";
};

/**
 * Cierra el modal de formulario
 */
const cerrarModalFn = () => {
  modal.style.display = "none";
};

// Eventos de modal
cerrarModal.addEventListener("click", cerrarModalFn);
btnCancelar.addEventListener("click", cerrarModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModalFn();
});


// ====== NAVEGACIÓN ======

btnVolverVehiculos.addEventListener("click", () => {
  window.location.href = "vehiculos.html";
});

btnIrdashboard.addEventListener("click", () => {
  window.location.href = "index.html";
});


// ====== ABRIR FORMULARIO PARA NUEVA VENTA ======

/**
 * Prepara el formulario en modo CREAR
 */
btnAddVenta.addEventListener("click", async () => {
  formTitle.textContent = "Añadir nueva venta";
  form.dataset.modo = "crear";

  // Reset campos
  inputs.id.value = "";
  inputs.fecha.value = "";
  inputs.tipo.value = "";
  inputs.precio_venta.value = "";
  inputs.notas.value = "";
  inputs.creado_at.value = "";

  // cargar selects
  await cargarVehiculosSelect(false);
  await cargarClientesSelect(false);
  await cargarUsuariosSelect(false);

  // campo creado_at visible solo en edición
  grupoCreado.style.display = "none";

  // mostrar botón de "nuevo cliente"
  btnAddCliente.style.display = "block";

  abrirModalFn();
});


// ====== SELECT: VEHÍCULOS ======

/**
 * Llena el <select> con la lista de matrículas disponibles
 * bloquea vehículos no disponibles excepto en edición
 */
async function cargarVehiculosSelect(disabled = false, vehiculoActual = null) {
  try {
    const res = await fetch(API_VEHICULOS);
    const vehiculos = await res.json();

    const vehiculoSelect = inputs.vehiculo_id;
    vehiculoSelect.textContent = "";

    // opción por defecto
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar vehículo...";
    vehiculoSelect.appendChild(defaultOption);

    vehiculos.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.matricula;
      option.textContent = `${v.matricula} - ${v.marca} ${v.modelo} (${v.estado})`;

      // si es un vehículo NO disponible, se bloquea
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


// ====== SELECT: CLIENTES ======

/**
 * Llena el <select> con clientes (DNI - nombre)
 */
async function cargarClientesSelect(disabled = false, clienteActual = null) {
  try {
    const res = await fetch(API_CLIENTES);
    const clientes = await res.json();

    const clienteSelect = inputs.cliente_dni;
    clienteSelect.textContent = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar cliente...";
    clienteSelect.appendChild(defaultOption);

    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.dni;
      option.textContent = `${c.dni} - ${c.nombre} ${c.apellidos}`;
      clienteSelect.appendChild(option);
    });

    if (clienteActual) clienteSelect.value = clienteActual;

    clienteSelect.disabled = disabled;
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}


// ====== SELECT: USUARIOS ======

/**
 * Llena el <select> con usuarios empleados/vendedores
 */
async function cargarUsuariosSelect(disabled = false, vendedorActual = null) {
  try {
    const res = await fetch(API_USUARIOS);
    const usuarios = await res.json();

    const usuarioSelect = inputs.vendedor_id;
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


// ====== CARGAR LISTA DE VENTAS EN TABLA ======

/**
 * Obtiene todas las ventas y renderiza tabla HTML
 */
async function cargarVentas() {
  try {
    const res = await fetch(API_VENTAS);
    const ventas = await res.json();

    tableBody.textContent = "";
    const fragment = document.createDocumentFragment();

    ventas.forEach((v) => {
      const row = document.createElement("tr");

      const fechaFmt = v.fecha
        ? new Date(v.fecha).toLocaleDateString("es-ES")
        : "";

      const creadoFmt = v.creado_at
        ? new Date(v.creado_at).toLocaleDateString("es-ES")
        : "";

      const precioFmt =
        v.precio_venta != null
          ? new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(v.precio_venta)
          : "";

      [
        v.venta_id,
        v.vehiculo_id,
        v.cliente_dni,
        fechaFmt,
        v.tipo,
        precioFmt,
        v.vendedor_id,
        v.notas,
        creadoFmt,
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor ?? "";
        row.appendChild(td);
      });

      // acciones
      const accionesTd = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.dataset.id = v.venta_id;

      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn-eliminar";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.dataset.id = v.venta_id;

      accionesTd.append(btnEditar, btnEliminar);
      row.appendChild(accionesTd);

      fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
  } catch (err) {
    console.error("Error al cargar ventas:", err);
  }
}


// ====== EDITAR VENTA ======

/**
 * Maneja el click de botón editar — carga datos en formulario
 */
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    form.dataset.modo = "editar";
    formTitle.textContent = "Editar venta";

    try {
      const res = await fetch(`${API_VENTAS}/${id}`);
      const venta = await res.json();

      // carga selects en modo edición
      await cargarVehiculosSelect(true, venta.vehiculo_id);
      await cargarClientesSelect(true, venta.cliente_dni);
      await cargarUsuariosSelect(false, venta.vendedor_id);

      // volcado de valores
      inputs.id.value = venta.venta_id;
      inputs.vehiculo_id.value = venta.vehiculo_id;
      inputs.cliente_dni.value = venta.cliente_dni;
      inputs.fecha.value = venta.fecha ? venta.fecha.split("T")[0] : "";
      inputs.tipo.value = venta.tipo;
      inputs.precio_venta.value = venta.precio_venta;
      inputs.vendedor_id.value = venta.vendedor_id;
      inputs.notas.value = venta.notas ?? "";
      inputs.creado_at.value = venta.creado_at
        ? venta.creado_at.split("T")[0]
        : "";

      grupoCreado.style.display = "block";
      inputs.creado_at.disabled = true;

      btnAddCliente.style.display = "none";

      abrirModalFn();
    } catch (err) {
      console.error("Error al cargar venta para edición:", err);
    }
  }
});


// ====== GUARDAR VENTA ======

/**
 * Envía los datos del formulario al backend para crear o editar
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // objeto que se envía
  const datos = {
    vehiculo_id: inputs.vehiculo_id.value,
    cliente_dni: inputs.cliente_dni.value,
    fecha: inputs.fecha.value,
    tipo: inputs.tipo.value,
    precio_venta: inputs.precio_venta.value,
    vendedor_id: inputs.vendedor_id.value,
    notas: inputs.notas.value,
  };

  const modo = form.dataset.modo;
  let url = API_VENTAS;
  let metodo = "POST";

  if (modo === "editar") {
    metodo = "PUT";
    url = `${API_VENTAS}/${inputs.id.value}`;
  }

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();
    alert(data.mensaje || "Operación realizada correctamente");
    cerrarModalFn();
    cargarVentas();
  } catch (err) {
    console.error("Error al guardar venta:", err);
  }
});


// ====== ELIMINAR VENTA ======

/**
 * Envía petición DELETE al backend।
 */
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Seguro que deseas eliminar esta venta?")) {
      try {
        const res = await fetch(`${API_VENTAS}/${id}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.mensaje || "Venta eliminada");
        cargarVentas();
      } catch (err) {
        console.error("Error al eliminar venta:", err);
      }
    }
  }
});


// ====== MODAL NUEVO CLIENTE ======

/**
 * Manejo del mini-modal para crear clientes directamente desde ventas
 */
const clienteModal = document.getElementById("clienteModal");
const btnAddCliente = document.getElementById("btnAddCliente");
const cerrarClienteModal = document.getElementById("cerrarClienteModal");

// abrir mini modal
btnAddCliente.addEventListener("click", () => {
  clienteModal.style.display = "block";
});

// cerrar mini modal
cerrarClienteModal.addEventListener("click", () => {
  clienteModal.style.display = "none";
});

// cerrar modal si clic fuera
window.addEventListener("click", (e) => {
  if (e.target === clienteModal) clienteModal.style.display = "none";
});


// ====== SUBMIT NUEVO CLIENTE ======

/**
 * Crea un nuevo cliente directamente desde el modal
 */
const clienteForm = document.getElementById("clienteForm");

clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dni = document.getElementById("cliente_dni_nuevo").value.trim();
  const nombre = document.getElementById("cliente_nombre_nuevo").value.trim();
  const apellidos =
    document.getElementById("cliente_apellidos_nuevo").value.trim();
  const email = document.getElementById("cliente_email_nuevo").value.trim();
  const telefono =
    document.getElementById("cliente_telefono_nuevo").value.trim();
  const direccion =
    document.getElementById("cliente_direccion_nuevo").value.trim();

  try {
    const res = await fetch("http://localhost:3000/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni,
        nombre,
        apellidos,
        email,
        telefono,
        direccion,
      }),
    });
    const data = await res.json();
    if (data.error) return alert(data.error);

    alert("Cliente creado correctamente");
    clienteModal.style.display = "none";
    clienteForm.reset();

    // Recargar el select de clientes y seleccionar al nuevo
    await cargarClientesSelect(false, dni);
    btnAddCliente.style.display = "none";
  } catch (err) {
    console.error("Error al crear cliente:", err);
    alert("Error al crear cliente");
  }
});


// ====== INICIALIZACIÓN ======

/**
 * Al cargar la página se ejecuta cargarVentas()
 */
window.addEventListener("DOMContentLoaded", cargarVentas);