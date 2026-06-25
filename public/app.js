const API_BASE = "";
const SERVICIOS = ["Energia", "Telecomunicaciones", "Sepelio", "Institucional", "ADECOOP"];

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatearFecha(value) {
  if (!value) return "Sin fecha";

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function obtenerImagenUrl(media) {
  if (!media) return "";

  const imagen = Array.isArray(media) ? media[0] : media;
  const url = imagen?.formats?.medium?.url || imagen?.formats?.small?.url || imagen?.url;

  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

function resumirTexto(texto = "", max = 150) {
  const limpio = String(texto).replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max).trim()}...` : limpio;
}

function crearUrlDetalle(noticia) {
  if (noticia.slug) return `/noticia.html?slug=${encodeURIComponent(noticia.slug)}`;
  return `/noticia.html?id=${encodeURIComponent(noticia.documentId)}`;
}

function crearCard(noticia) {
  const card = document.createElement("article");
  card.className = "news-card";

  const fecha = formatearFecha(noticia.fecha_publicacion || noticia.publishedAt);
  const imagenUrl = obtenerImagenUrl(noticia.imagen_destacada);
  const servicio = noticia.servicio || "Institucional";
  const resumen = noticia.resumen || "Sin resumen disponible.";

  card.innerHTML = `
    <a class="news-card-link" href="${crearUrlDetalle(noticia)}" aria-label="Leer ${escapeHTML(noticia.titulo)}">
      ${
        imagenUrl
          ? `<img class="news-image" src="${escapeHTML(imagenUrl)}" alt="${escapeHTML(noticia.titulo)}" loading="lazy">`
          : `<div class="news-image news-image-placeholder">COOPSAR</div>`
      }
      <div class="news-card-content">
        <div class="news-meta">
          <span>${escapeHTML(servicio)}</span>
          <time datetime="${escapeHTML(noticia.fecha_publicacion || noticia.publishedAt || "")}">${escapeHTML(fecha)}</time>
        </div>
        <h3>${escapeHTML(noticia.titulo)}</h3>
        <p>${escapeHTML(resumirTexto(resumen))}</p>
        <span class="card-link">Leer mas</span>
      </div>
    </a>
  `;

  return card;
}

function crearFiltros() {
  const filtro = document.getElementById("servicioFiltro");
  if (!filtro) return;

  SERVICIOS.forEach((servicio) => {
    const option = document.createElement("option");
    option.value = servicio;
    option.textContent = servicio;
    filtro.appendChild(option);
  });

  filtro.addEventListener("change", () => cargarNoticias(filtro.value));
}

async function cargarNoticias(servicio = "") {
  const grid = document.getElementById("noticiasGrid");
  const estado = document.getElementById("noticiasEstado");

  if (!grid) return;

  grid.innerHTML = `<p class="loading">Cargando noticias...</p>`;
  if (estado) estado.textContent = "";

  const params = new URLSearchParams({
    "sort[0]": "fecha_publicacion:desc",
    "sort[1]": "publishedAt:desc",
    populate: "imagen_destacada",
    "pagination[pageSize]": "12",
  });

  if (servicio) params.set("filters[servicio][$eq]", servicio);

  try {
    const respuesta = await fetch(`${API_BASE}/api/noticias?${params.toString()}`);

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    const noticias = resultado.data || [];

    grid.innerHTML = "";

    if (noticias.length === 0) {
      grid.innerHTML = `<p class="empty-state">No hay noticias publicadas para mostrar.</p>`;
      if (estado) estado.textContent = "Sin resultados";
      return;
    }

    noticias.forEach((noticia) => grid.appendChild(crearCard(noticia)));

    if (estado) {
      estado.textContent = `${noticias.length} ${noticias.length === 1 ? "noticia" : "noticias"}`;
    }
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <strong>No se pudieron cargar las noticias.</strong>
        <p>Revisa que Strapi este publicado y que el rol Public tenga permisos de lectura.</p>
      </div>
    `;
    console.error(error);
  }
}

crearFiltros();
cargarNoticias();
