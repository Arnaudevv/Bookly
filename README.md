# 📚 BOOKLY — Tu Biblioteca Personal

> Organiza y gestiona tu colección de libros por categorías, desde una interfaz limpia y minimalista.

---

## ✨ Funcionalidades

| Acción | Descripción |
|--------|-------------|
| ➕ **Añadir libro** | Modal con formulario: título, autor, fecha, páginas e idioma |
| ✏️ **Editar libro** | Formulario inline dentro del acordeón de cada libro |
| 🗑️ **Eliminar libro** | Botón directo desde el detalle del libro |
| 🗂️ **18 categorías** | Acordeón visual con icono, nombre y contador de libros |

---

## 🗂️ Categorías disponibles

```
Ciencia Ficción · Fantasía · Romance · Thriller · Desarrollo Personal · Ciencia
Historia · Biografías · Terror · Infantil · Cocina · Arte
Viajes · Poesía · Cómic · Filosofía · Negocios · Aventura
```

---

## 🏗️ Stack técnico

```
Backend   →  Python · Flask
Base de datos  →  MongoDB Atlas
Frontend  →  HTML · CSS · JavaScript (Vanilla)
Plantillas  →  Jinja2
```

---

## 📁 Estructura del proyecto

```
bookly/
├── app.py              # Rutas Flask + lógica MongoDB
├── templates/
│   └── index.html      # UI principal (Jinja2)
└── static/
    ├── style.css        # Estilos
    ├── biblioteca.js    # Acordeones + modal
    └── img/             # Iconos de categorías
```
