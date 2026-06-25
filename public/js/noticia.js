import { escapeHTML, formatDate, imageUrl } from "./utils.js";

const API_BASE = "";
const FRONTEND_API = "/api/frontend";

function renderRichText(content = "") {
  return String(content)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHTML(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

async function findArticle({ slug, documentId }) {
  if (slug) {
    const params = new URLSearchParams({
      "filters[slug][$eq]": slug,
      populate: "imagen_destacada",
    });
    const response = await fetch(`${FRONTEND_API}/noticias?${params.toString()}`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const payload = await response.json();
    return payload.data?.[0];
  }

  if (documentId) {
    const params = new URLSearchParams({ populate: "imagen_destacada" });
    const response = await fetch(`${API_BASE}/api/noticias/${documentId}?${params.toString()}`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const payload = await response.json();
    return payload.data;
  }

  return null;
}

export async function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const container = document.getElementById("detalleNoticia");

  try {
    const article = await findArticle({
      slug: params.get("slug"),
      documentId: params.get("id"),
    });

    if (!article) {
      container.innerHTML = `
        <a href="/noticias" class="back-link">Volver a noticias</a>
        <p class="empty-state">No se encontro la noticia solicitada.</p>
      `;
      return;
    }

    const img = imageUrl(article.imagen_destacada);
    const date = formatDate(article.fecha_publicacion || article.publishedAt);
    document.title = `${article.titulo} | COOPSAR`;

    container.innerHTML = `
      <a href="/noticias" class="back-link">Volver a noticias</a>
      ${img ? `<img class="detail-image" src="${escapeHTML(img)}" alt="${escapeHTML(article.titulo)}">` : ""}
      <div class="detail-meta">
        <span class="detail-label">${escapeHTML(article.servicio || "Institucional")}</span>
        ${date ? `<time>${escapeHTML(date)}</time>` : ""}
      </div>
      <h1>${escapeHTML(article.titulo)}</h1>
      ${article.resumen ? `<p class="detail-summary">${escapeHTML(article.resumen)}</p>` : ""}
      <div class="detail-content">
        ${renderRichText(article.contenido) || "<p>Esta noticia todavia no tiene contenido publicado.</p>"}
      </div>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <a href="/noticias" class="back-link">Volver a noticias</a>
      <div class="empty-state">
        <strong>No se pudo cargar la noticia.</strong>
        <p>Revisa que la API publica de Strapi tenga permisos de lectura.</p>
      </div>
    `;
  }
}
