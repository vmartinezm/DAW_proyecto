// URL base de la API
const API_URL = 'http://localhost:3000/vehiculos';

// Referencia al tbody de la tabla
const tableBody = document.querySelector('#vehiculosTable tbody');

// Función para obtener vehículos y mostrarlos
async function cargarVehiculos() {
  try {
    const res = await fetch(API_URL);
    const vehiculos = await res.json();

    tableBody.innerHTML = ''; // Limpiar tabla

    vehiculos.forEach(v => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${v.id}</td>
        <td>${v.marca}</td>
        <td>${v.modelo}</td>
        <td>${v.matricula}</td>
        <td>${v.color}</td>
        <td>${v.ano}</td>
        <td>${v.kilometros}</td>
        <td>${v.combustible}</td>
        <td>${v.precio}</td>
        <td>${v.estado}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar vehículos:', error);
  }
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', cargarVehiculos);
