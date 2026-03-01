const PAPELERA_KEY = 'bookly_papelera';

document.addEventListener('DOMContentLoaded', () => {
    cargarPapelera();
    initCategorias();
    initLibros();
    initModal();
    initPapelera();
    actualizarContadorPapelera();
});


/* ─────────────────────────────────────────────
   0. PAPELERA — Gestión del localStorage
───────────────────────────────────────────── */

/**
 * Obtiene los libros eliminados del localStorage
 */
function obtenerLibrosEliminados() {
    try {
        const datos = localStorage.getItem(PAPELERA_KEY);
        return datos ? JSON.parse(datos) : {};
    } catch (e) {
        console.error('Error al leer papelera:', e);
        return {};
    }
}

/**
 * Guarda los libros eliminados en localStorage
 */
function guardarLibrosEliminados(libros) {
    try {
        localStorage.setItem(PAPELERA_KEY, JSON.stringify(libros));
    } catch (e) {
        console.error('Error al guardar papelera:', e);
    }
}

/**
 * Agrega un libro a la papelera
 */
function agregarAPapelera(libroId, categoria, libroData) {
    const papelera = obtenerLibrosEliminados();
    papelera[`${categoria}:${libroId}`] = {
        id: libroId,
        categoria: categoria,
        datos: libroData,
        fechaEliminacion: new Date().toISOString()
    };
    guardarLibrosEliminados(papelera);
    actualizarContadorPapelera();
}

/**
 * Elimina un libro de la papelera
 */
function quitarDePapelera(libroId, categoria) {
    const papelera = obtenerLibrosEliminados();
    delete papelera[`${categoria}:${libroId}`];
    guardarLibrosEliminados(papelera);
    actualizarContadorPapelera();
}

/**
 * Actualiza el contador del botón papelera
 */
function actualizarContadorPapelera() {
    const papelera = obtenerLibrosEliminados();
    const cantidad = Object.keys(papelera).length;
    const contador = document.getElementById('contadorPapelera');
    if (contador) {
        contador.textContent = cantidad > 0 ? cantidad : '';
    }
}

/**
 * Carga la papelera (oculta libros que están en ella)
 */
function cargarPapelera() {
    const papelera = obtenerLibrosEliminados();
    for (const clave in papelera) {
        const [categoria, libroId] = clave.split(':');
        const elemento = document.querySelector(
            `.libro[data-libro-id="${libroId}"][data-categoria="${categoria}"]`
        );
        if (elemento) {
            elemento.classList.add('oculto');
        }
    }
}


/* ─────────────────────────────────────────────
   1. ACORDEÓN DE CATEGORÍAS
───────────────────────────────────────────── */
function initCategorias() {
    const botones = document.querySelectorAll('.categoria__cabecera');

    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.nextElementSibling;
            const estaAbierto = btn.getAttribute('aria-expanded') === 'true';

            botones.forEach(otroBtn => {
                if (otroBtn !== btn) {
                    otroBtn.setAttribute('aria-expanded', 'false');
                    otroBtn.nextElementSibling.classList.remove('abierto');
                    cerrarLibrosDe(otroBtn.nextElementSibling);
                }
            });

            const nuevoEstado = !estaAbierto;
            btn.setAttribute('aria-expanded', String(nuevoEstado));
            panel.classList.toggle('abierto', nuevoEstado);

            if (!nuevoEstado) cerrarLibrosDe(panel);
        });
    });
}

function cerrarLibrosDe(panel) {
    panel.querySelectorAll('.libro__cabecera[aria-expanded="true"]').forEach(lb => {
        lb.setAttribute('aria-expanded', 'false');
        lb.nextElementSibling.classList.remove('abierto');
    });
}


/* ─────────────────────────────────────────────
   2. ACORDEÓN DE LIBROS + INTERCEPTAR ELIMINAR
───────────────────────────────────────────── */
function initLibros() {
    document.querySelector('.biblioteca').addEventListener('click', e => {
        // Manejar botón eliminar dentro del formulario
        if (e.target.closest('.btn--danger')) {
            e.preventDefault();
            e.stopPropagation();

            const form = e.target.closest('.libro__form');
            const libroId = form.querySelector('input[name="libro_id"]').value;
            const categoria = form.querySelector('input[name="categoria"]').value;
            const libroEl = form.closest('.libro');

            // Recolectar datos del libro
            const libroData = {
                titulo: form.querySelector('input[name="titulo"]').value,
                autor: form.querySelector('input[name="autor"]').value,
                fecha: form.querySelector('input[name="fecha"]').value,
                idioma: form.querySelector('select[name="idioma"]').value,
                paginas: form.querySelector('input[name="paginas"]').value
            };

            // Agregar a papelera
            agregarAPapelera(libroId, categoria, libroData);

            // Ocultar visualmente
            libroEl.classList.add('oculto');

            // Cerrar el panel del libro
            const cabecera = libroEl.querySelector('.libro__cabecera');
            cabecera.setAttribute('aria-expanded', 'false');
            cabecera.nextElementSibling.classList.remove('abierto');

            return;
        }

        // Manejar acordeón de libro normal
        const btn = e.target.closest('.libro__cabecera');
        if (!btn) return;

        const libroEl = btn.parentElement;
        const panel = btn.nextElementSibling;
        const lista = btn.closest('.libros-lista');
        const estaAbierto = btn.getAttribute('aria-expanded') === 'true';

        lista.querySelectorAll('.libro__cabecera[aria-expanded="true"]').forEach(lb => {
            if (lb !== btn) {
                lb.setAttribute('aria-expanded', 'false');
                lb.nextElementSibling.classList.remove('abierto');
            }
        });

        const nuevoEstado = !estaAbierto;
        btn.setAttribute('aria-expanded', String(nuevoEstado));
        panel.classList.toggle('abierto', nuevoEstado);

        if (nuevoEstado) {
            setTimeout(() => {
                const listaRect = lista.getBoundingClientRect();
                const libroRect = libroEl.getBoundingClientRect();
                const exceso = libroRect.bottom - listaRect.bottom;
                if (exceso > 0) {
                    lista.scrollBy({ top: exceso + 8, behavior: 'smooth' });
                }
                if (libroRect.top < listaRect.top) {
                    lista.scrollBy({
                        top: libroRect.top - listaRect.top - 8,
                        behavior: 'smooth'
                    });
                }
            }, 260);
        }
    });
}


/* ─────────────────────────────────────────────
   3. MODAL — AÑADIR LIBRO
───────────────────────────────────────────── */
function initModal() {
    const overlay = document.getElementById('overlay');
    const categoriaInput = document.getElementById('categoriaInput');
    const btnCerrar = document.getElementById('btnCerrarModal');
    const btnCancelar = document.getElementById('btnCancelar');

    if (!overlay) return;

    document.querySelector('.biblioteca').addEventListener('click', e => {
        const btn = e.target.closest('.btn-aniadir');
        if (!btn) return;

        categoriaInput.value = btn.dataset.categoria ?? '';
        abrirModal();
    });

    btnCerrar?.addEventListener('click', cerrarModal);
    btnCancelar?.addEventListener('click', cerrarModal);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) cerrarModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('activo')) cerrarModal();
    });

    function abrirModal() {
        overlay.classList.add('activo');
        document.body.classList.add('modal-abierto');
    }

    function cerrarModal() {
        overlay.classList.remove('activo');
        document.body.classList.remove('modal-abierto');
    }
}


/* ─────────────────────────────────────────────
   4. PAPELERA — MODAL Y GESTIÓN
───────────────────────────────────────────── */
function initPapelera() {
    const overlayPapelera = document.getElementById('overlayPapelera');
    const btnPapelera = document.getElementById('btnPapelera');
    const btnCerrarPapelera = document.getElementById('btnCerrarPapelera');

    if (!overlayPapelera || !btnPapelera) return;

    // Abrir papelera
    btnPapelera.addEventListener('click', () => {
        renderizarPapelera();
        overlayPapelera.classList.add('activo');
        document.body.classList.add('modal-abierto');
    });

    // Cerrar papelera
    btnCerrarPapelera?.addEventListener('click', cerrarPapelera);

    overlayPapelera.addEventListener('click', e => {
        if (e.target === overlayPapelera) cerrarPapelera();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlayPapelera.classList.contains('activo')) cerrarPapelera();
    });

    function cerrarPapelera() {
        overlayPapelera.classList.remove('activo');
        document.body.classList.remove('modal-abierto');
    }

    // Manejar acciones en papelera
    document.addEventListener('click', e => {
        // Recuperar
        if (e.target.closest('.papelera__btn-recuperar')) {
            const btn = e.target.closest('.papelera__btn-recuperar');
            const libroId = btn.dataset.libroId;
            const categoria = btn.dataset.categoria;
            recuperarLibro(libroId, categoria);
            renderizarPapelera();
            return;
        }

        // Eliminar definitivamente
        if (e.target.closest('.papelera__btn-eliminar')) {
            const btn = e.target.closest('.papelera__btn-eliminar');
            const libroId = btn.dataset.libroId;
            const categoria = btn.dataset.categoria;
            eliminarDefinitivamente(libroId, categoria);
            renderizarPapelera();
            return;
        }
    });
}

/**
 * Renderiza la lista de libros en la papelera
 */
function renderizarPapelera() {
    const papelera = obtenerLibrosEliminados();
    const contenedor = document.getElementById('papeleraContenido');

    if (!contenedor) return;

    if (Object.keys(papelera).length === 0) {
        contenedor.innerHTML = '<div class="papelera__vacia">Sin libros en la papelera</div>';
        return;
    }

    let html = '';
    for (const clave in papelera) {
        const item = papelera[clave];
        const { id, categoria, datos } = item;

        html += `
            <div class="papelera__item">
                <div class="papelera__item-titulo">${escapeHtml(datos.titulo)}</div>
                <div class="papelera__item-meta">
                    <span><strong>Autor:</strong> ${escapeHtml(datos.autor)}</span>
                    <span><strong>Categoría:</strong> ${obtenerNombreCategoria(categoria)}</span>
                </div>
                <div class="papelera__item-acciones">
                    <button type="button" class="papelera__btn-recuperar" data-libro-id="${id}" data-categoria="${categoria}">
                        Recuperar
                    </button>
                    <button type="button" class="papelera__btn-eliminar" data-libro-id="${id}" data-categoria="${categoria}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

/**
 * Recupera un libro de la papelera
 */
function recuperarLibro(libroId, categoria) {
    // Quitar de papelera
    quitarDePapelera(libroId, categoria);

    // Mostrar el elemento en el DOM
    const elemento = document.querySelector(
        `.libro[data-libro-id="${libroId}"][data-categoria="${categoria}"]`
    );
    if (elemento) {
        elemento.classList.remove('oculto');
    }

    // Cerrar el panel si estaba abierto
    const cabecera = elemento?.querySelector('.libro__cabecera');
    if (cabecera) {
        cabecera.setAttribute('aria-expanded', 'false');
        cabecera.nextElementSibling.classList.remove('abierto');
    }
}

/**
 * Elimina definitivamente un libro (envía petición al backend)
 */
function eliminarDefinitivamente(libroId, categoria) {
    // Quitar de papelera
    quitarDePapelera(libroId, categoria);

    // Eliminar del DOM
    const elemento = document.querySelector(
        `.libro[data-libro-id="${libroId}"][data-categoria="${categoria}"]`
    );
    if (elemento) {
        elemento.remove();
    }

    // Enviar petición al backend para eliminar de BD
    const form = new FormData();
    form.append('libro_id', libroId);
    form.append('categoria', categoria);

    fetch('/eliminar_llibre', {
        method: 'POST',
        body: form
    }).catch(err => console.error('Error al eliminar:', err));
}

/**
 * Obtiene el nombre legible de una categoría
 */
function obtenerNombreCategoria(categoriaId) {
    const mapeo = {
        'ciencia-ficcion': 'Ciencia Ficción',
        'fantasia': 'Fantasía',
        'romance': 'Romance',
        'thriller': 'Thriller',
        'desarrollo-personal': 'Desarrollo Personal',
        'ciencia': 'Ciencia',
        'historia': 'Historia',
        'biografias': 'Biografías',
        'terror': 'Terror',
        'infantil': 'Infantil',
        'cocina': 'Cocina',
        'arte': 'Arte',
        'viajes': 'Viajes',
        'poesia': 'Poesía',
        'comic': 'Cómic',
        'filosofia': 'Filosofía',
        'negocios': 'Negocios',
        'aventura': 'Aventura'
    };
    return mapeo[categoriaId] || categoriaId;
}

/**
 * Escapa caracteres HTML para evitar XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}