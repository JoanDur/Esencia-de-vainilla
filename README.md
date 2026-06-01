# Esencia de Vainilla

Sistema web para la gestión y comercialización de postres artesanales desarrollado como proyecto académico de Ingeniería de Sistemas.

El sistema permite a los clientes explorar un catálogo de productos, realizar pedidos y gestionar su información, mientras que los administradores pueden administrar categorías, productos, usuarios y pedidos desde un panel administrativo.

---

# Descripción del Proyecto

Esencia de Vainilla es una plataforma web orientada a una pastelería o tienda de postres artesanales.

La aplicación implementa una arquitectura cliente-servidor donde:

- El frontend proporciona la interfaz gráfica para clientes y administradores.
- El backend expone una API REST desarrollada con FastAPI.
- PostgreSQL almacena la información del sistema.

---

# Objetivo General

Desarrollar una aplicación web para la gestión integral de una tienda de postres, permitiendo administrar productos, categorías, usuarios y pedidos mediante una interfaz intuitiva y una API REST segura y escalable, mostrando el dominio de bases de datos en SQL aprendido durante el semestre.

---

# Funcionalidades

## Cliente

- Registro de usuarios.
- Inicio de sesión.
- Consulta de catálogo de productos.
- Carrito de compras.
- Realización de pedidos.
- Consulta de pedidos realizados.

## Administrador

- Gestión de productos.
- Gestión de categorías.
- Gestión de usuarios.
- Gestión de pedidos.
- Cambio de estados de pedidos.

---

# Tecnologías Utilizadas

## Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- Psycopg2

## Base de Datos

- PostgreSQL

## Frontend

- HTML5
- CSS3
- JavaScript

## Control de Versiones

- Git
- GitHub

---

# Arquitectura del Proyecto

```text
Proyecto/
│
├── app/
│   ├── models/
│   ├── repositories/
│   ├── routers/
│   ├── database.py
│   └── main.py
│
├── static/
│   ├── admin-dashboard.html
│   ├── catalogo.html
│   ├── carrito.html
│   ├── login.html
│   └── ...
│
├── requirements.txt
│
└── Proyecto.sql
```

### Modelos

Definen la estructura y validación de los datos mediante Pydantic.

### Repositories

Implementan el acceso a la base de datos.

### Routers

Gestionan los endpoints de la API REST.

### Static

Contiene la interfaz gráfica desarrollada en HTML, CSS y JavaScript.

---

# Modelo de Datos

El sistema está compuesto por las siguientes entidades principales:

- Usuario
- Rol
- Categoría
- Producto
- Pedido
- DetallePedido
- Dirección

Relaciones principales:

- Un usuario puede realizar varios pedidos.
- Un pedido contiene varios productos.
- Un producto pertenece a una categoría.

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/juanest99/Esencia-de-Vainilla.git
```

## 2. Entrar al proyecto

```bash
cd Esencia-de-Vainilla/Proyecto
```

## 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## 4. Crear la base de datos

Ejecutar el script:

```sql
Proyecto.sql
```

sobre PostgreSQL.

## 5. Configurar variables de entorno

Crear un archivo `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esencia_vainilla
DB_USER=postgres
DB_PASSWORD=contraseña :D
```

## 6. Ejecutar el servidor

```bash
uvicorn app.main:app --reload
```

---

# Endpoints Principales

## Usuarios

- Registro de usuario
- Inicio de sesión
- Consulta de usuarios

## Categorías

- Crear categoría
- Consultar categorías
- Actualizar categoría
- Eliminar categoría

## Productos

- Crear producto
- Consultar productos
- Actualizar producto
- Eliminar producto

## Pedidos

- Crear pedido
- Consultar pedidos
- Actualizar estado del pedido

---

# Capturas del Sistema

<img width="1600" height="738" alt="im1" src="https://github.com/user-attachments/assets/6c624c8c-3980-4145-ba88-31067d3c6f84" />

<img width="1600" height="738" alt="im2" src="https://github.com/user-attachments/assets/ca49a46a-b562-48a4-8a61-5c7a9e4240f3" />

# Prueba de Funcionamiento

La API dispone de un endpoint de verificación:

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "mensaje": "API funcionando correctamente"
}
```

---

# Autores

**Joan Sebastian Duran Pradilla**  
**Edilson Santiago Sepúlveda Cortés**  
**Juan Esteban Cañón Solorza**  
**Laura Nathaly Páez Cifuentes**  

Estudiantes de Ingeniería de Sistemas.

---

# Contexto Académico

Proyecto desarrollado para la asignatura de Bases de Datos.

Universidad Distritral Francisco Jose de Caldas.

2026

---

# Licencia

Proyecto académico desarrollado con fines educativos.
