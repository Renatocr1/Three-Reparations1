# Despliegue con XAMPP (Windows)

Guía para correr **Three Reparations** en otra PC usando XAMPP (MySQL) + Node.js.

La app está hecha con **Node.js + Express** y usa **MySQL/MariaDB**. Al arrancar
**crea sola todas las tablas** y siembra el catálogo de servicios, así que la base
de datos puede partir vacía.

## Requisitos
- [XAMPP](https://www.apachefriends.org/) (incluye MySQL/MariaDB)
- [Node.js](https://nodejs.org/) versión LTS

## Pasos

### 1. Arrancar XAMPP
Abre el panel de XAMPP y dale **Start** a **MySQL** (y a **Apache** si quieres usar phpMyAdmin).

### 2. Conseguir el código
Con git:
```
git clone https://github.com/crisKstre/three-reparations.git
```
O sin git: en la página del repo, botón **Code → Download ZIP**, y descomprime.

### 3. Instalar dependencias
En **CMD** o **PowerShell**, dentro de la carpeta del proyecto:
```
npm install
```
(Reinstala lo necesario porque `node_modules` no viaja en el repo. `bcrypt` se
instala solo; con Node LTS en Windows trae binarios listos.)

### 4. Base de datos
Con XAMPP los valores por defecto coinciden con los de la app
(`localhost`, usuario `root`, **sin contraseña**, base `integracion1`, puerto `3306`),
así que **no hay que configurar nada**: basta con que MySQL esté corriendo.
La app crea las tablas al arrancar.

> **Opcional — importar datos de ejemplo:** abre phpMyAdmin
> (http://localhost/phpmyadmin), crea la base **`integracion1`** (el dump no la crea),
> entra a la pestaña **Import** y elige **`integracion1.sql`**. Solo agrega un
> cliente de prueba, así que normalmente no hace falta.

### 5. Arrancar la app
```
node server.js
```
Abre **http://localhost:3000**

### 6. Crear un usuario administrador
Ni la base vacía ni el `.sql` traen un admin. Para tener uno:
1. Regístrate en la web con un correo `@gmail.com`.
2. En **phpMyAdmin → pestaña SQL** ejecuta (con tu correo):
   ```sql
   UPDATE usuarios SET rol='admin' WHERE correo='TUCORREO@gmail.com';
   ```
3. Cierra sesión y vuelve a entrar: ya eres admin (ves servicios, diagnósticos, etc.).

## Notas
- **Si tu MySQL tiene contraseña** o usa otro puerto, defínelo al arrancar:
  - CMD: `set DB_PASSWORD=tuclave && node server.js`
  - PowerShell: `$env:DB_PASSWORD="tuclave"; node server.js`
  - Variables disponibles: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`.
- **Puerto 3000 ocupado:** `set PORT=3001 && node server.js`.
- **Cada vez que enciendas el PC:** abre XAMPP (Start MySQL) y corre `node server.js`.
