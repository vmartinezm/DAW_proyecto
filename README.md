🚗 Concesionario Martínez — Sistema de Gestión

Aplicación web completa para la gestión de un concesionario: vehículos, clientes, mantenimientos, ventas, usuarios y control de acceso mediante autenticación JWT.

📦 Tecnologías utilizadas
- Backend
- Node.js
- Express
- MySQL
- bcrypt
- jsonwebtoken
- express-validator
- Frontend
- HTML + CSS
- JavaScript Vanilla
- sessionStorage para sesión local
- Comunicación API mediante fetch() + Bearer Token

Documentación

JSDoc (generación automática de documentación técnica)

🛠️ Instalación y configuración

1️⃣ Clonar repositorio
git clone https://github.com/tuusuario/vehiculos-concesionario.git
cd vehiculos-concesionario

2️⃣ Instalar dependencias backend
npm install

3️⃣ Configurar variables de entorno

Crear archivo:

.env

Y dentro escribir:

DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=concesionario
JWT_SECRET=loquesea123

4️⃣ Crear base de datos

Importar el script SQL incluido en /src/database.sql

5️⃣ Iniciar backend
npm start

6️⃣ Abrir frontend
Abrir public/index.html en navegador o servir con Live Server de VSCode

🔐 Sistema de autenticación

El sistema usa:

✔ login con usuario + contraseña
✔ hash con bcrypt
✔ token JWT enviado como Bearer en authFetch()
✔ roles: admin / empleado

El frontend protege acceso mediante:

requireLogin()
requireAdmin()

📁 Estructura del proyecto

📦 vehiculos-concesionario
 ┣ 📂public
 ┃ ┣ css/styles.css
 ┃ ┣ index.html
 ┃ ┣ login.html
 ┃ ┣ vehiculos.html
 ┃ ┣ clientes.html
 ┃ ┣ mantenimientos.html
 ┃ ┣ ventas.html
 ┃ ┣ usuarios.html
 ┃ ┗ 📂js
 ┃   ┣ auth.js
 ┃   ┣ vehiculos.js
 ┃   ┣ clientes.js
 ┃   ┣ mantenimientos.js
 ┃   ┣ ventas.js
 ┃   ┗ usuarios.js
 ┣ 📂src
 ┃ ┣ app.js
 ┃ ┣ config/db.js
 ┃ ┣ controllers/
 ┃ ┣ routes/
 ┃ ┣ middlewares/
 ┃ ┗ models (si aplica)
 ┣ package.json
 ┣ jsdoc.json
 ┗ README.md

🧪 Pruebas básicas de API

Ejemplo — obtener vehículos:

GET /vehiculos
Authorization: Bearer <token>

Crear vehículo:

POST /vehiculos
Authorization: Bearer <token>
Content-Type: application/json

📜 Documentación automática con JSDoc

Generar docs:

npx jsdoc -c jsdoc.json


Se genera directorio:

/docs


Abrir en navegador:

docs/index.html

👤 Roles del sistema
Rol	Permisos
admin	puede gestionar usuarios, vehículos, ventas, mantenimientos y clientes
empleado	limitado a módulos operativos
🚀 Mejoras futuras (Roadmap)

exportación de informes PDF/Excel

tabla con paginación real

validación frontend avanzada

notificaciones visuales sin alert()

rediseño UX más moderno

👨‍💻 Autor

Víctor Martínez
Proyecto final FP Desarrollo de Aplicaciones Web (DAW)
2025

📄 Licencia

Uso educativo y académico. No comercial.