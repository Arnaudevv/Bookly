import os
from flask import Flask, render_template, request, redirect, url_for
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)

MONGO_URI = "mongodb+srv://bibliotecaDB:ToniArnau@biblioteca.dusanse.mongodb.net/?appName=Biblioteca"
client = MongoClient(MONGO_URI)
db = client["Biblioteca"]

# Lista de categorías: define el orden, nombre visible e icono
categorias = [
    # ── Columna 1 ──────────────────────────────────────
    {"id": "ciencia-ficcion",    "nombre": "Ciencia Ficción",    "icono": "iconoCienciaFiccion.png"},
    {"id": "fantasia",           "nombre": "Fantasía",           "icono": "iconoFantasia.png"},
    {"id": "romance",            "nombre": "Romance",            "icono": "iconoRomance.png"},
    {"id": "thriller",           "nombre": "Thriller",           "icono": "iconoThriller.png"},
    {"id": "desarrollo-personal","nombre": "Desarrollo Personal","icono": "iconoDesarollo.png"},
    {"id": "ciencia",            "nombre": "Ciencia",            "icono": "iconoCiencia.png"},
    # ── Columna 2 ──────────────────────────────────────
    {"id": "historia",           "nombre": "Historia",           "icono": "iconoHistoria.png"},
    {"id": "biografias",         "nombre": "Biografías",         "icono": "iconoBiografias.png"},
    {"id": "terror",             "nombre": "Terror",             "icono": "iconoTerror.png"},
    {"id": "infantil",           "nombre": "Infantil",           "icono": "iconoInfantil.png"},
    {"id": "cocina",             "nombre": "Cocina",             "icono": "iconoCocina.png"},
    {"id": "arte",               "nombre": "Arte",               "icono": "iconoArte.png"},
    # ── Columna 3 ──────────────────────────────────────
    {"id": "viajes",             "nombre": "Viajes",             "icono": "iconoViajes.png"},
    {"id": "poesia",             "nombre": "Poesía",             "icono": "iconoPoesia.png"},
    {"id": "comic",              "nombre": "Cómic",              "icono": "iconoComic.png"},
    {"id": "filosofia",          "nombre": "Filosofía",          "icono": "iconoFilosofia.png"},
    {"id": "negocios",           "nombre": "Negocios",           "icono": "iconoNegocios.png"},
    {"id": "aventura",           "nombre": "Aventura",           "icono": "iconoAventura.png"},
]

# Mapeamos los IDs de categoría a sus colecciones en MongoDB
categorias_map = {
    "ciencia-ficcion":     "CienciaFiccion",
    "fantasia":            "Fantasia",
    "romance":             "Romance",
    "thriller":            "Thriller",
    "desarrollo-personal": "DesarrolloPersonal",
    "ciencia":             "Ciencia",
    "historia":            "Historia",
    "biografias":          "Biografias",
    "terror":              "Terror",
    "infantil":            "Infantil",
    "cocina":              "Cocina",
    "arte":                "Arte",
    "viajes":              "Viajes",
    "poesia":              "Poesia",
    "comic":               "Comic",
    "filosofia":           "Filosofia",
    "negocios":            "Negocios",
    "aventura":            "Aventura",
}


@app.route('/')
def index():
    libros_por_categoria = {}
    for cat in categorias:
        nombre_coleccion = categorias_map[cat["id"]]
        libros_por_categoria[cat["id"]] = list(db[nombre_coleccion].find({}))

    return render_template(
        'index.html',
        categorias=categorias,
        libros_por_categoria=libros_por_categoria
    )


@app.route('/afegir_llibre', methods=['POST'])
def agregar_libro():
    titulo   = request.form.get('titulo')
    autor    = request.form.get('autor')
    fecha    = request.form.get('fecha')
    idioma   = request.form.get('idioma')
    paginas  = request.form.get('paginas')
    categoria = request.form.get('categoria')

    if not all([titulo, autor, fecha, idioma, categoria]):
        return redirect(url_for('index'))

    paginas = int(paginas) if paginas else None

    libro = {
        'titulo':         titulo,
        'autor':          autor,
        'fecha':          fecha,
        'idioma':         idioma,
        'paginas':        paginas,
        'fecha_creacion': datetime.now()
    }

    nombre_coleccion = categorias_map.get(categoria)
    if nombre_coleccion:
        db[nombre_coleccion].insert_one(libro)

    return redirect(url_for('index'))


@app.route('/eliminar_llibre', methods=['POST'])
def eliminar_libro():
    from bson.objectid import ObjectId

    libro_id  = request.form.get('libro_id')
    categoria = request.form.get('categoria')

    if not libro_id or not categoria:
        return redirect(url_for('index'))

    nombre_coleccion = categorias_map.get(categoria)
    if nombre_coleccion:
        db[nombre_coleccion].delete_one({'_id': ObjectId(libro_id)})

    return redirect(url_for('index'))


@app.route('/editar_llibre', methods=['POST'])
def editar_libro():
    from bson.objectid import ObjectId

    libro_id  = request.form.get('libro_id')
    categoria = request.form.get('categoria')

    datos_actualizados = {
        'titulo':  request.form.get('titulo'),
        'autor':   request.form.get('autor'),
        'fecha':   request.form.get('fecha'),
        'idioma':  request.form.get('idioma'),
        'paginas': int(request.form.get('paginas')) if request.form.get('paginas') else 0
    }

    nombre_coleccion = categorias_map.get(categoria)
    if nombre_coleccion:
        db[nombre_coleccion].update_one(
            {'_id': ObjectId(libro_id)},
            {'$set': datos_actualizados}
        )

    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)