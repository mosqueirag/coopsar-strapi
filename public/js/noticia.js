import { escapeHTML, formatDate, imageUrl } from "./utils.js";

const API_BASE = "";
const FRONTEND_API = "/api/frontend";

function relationItems(value) {
  if (Array.isArray(value)) return value.map(item => item?.attributes ? { id: item.id, ...item.attributes } : item);
  if (Array.isArray(value?.data)) return value.data.map(item => item?.attributes ? { id: item.id, ...item.attributes } : item);
  return [];
}

function articleCategories(article) {
  return relationItems(article.categorias)
    .map(category => ({
      nombre: category.nombre || category.titulo || category.name,
      slug: category.slug || "",
    }))
    .filter(category => category.nombre);
}

function renderContent(content = "") {
  const value = String(content).trim();
  if (!value) return "";
  if (/<(p|h[1-6]|ul|ol|li|a|img|blockquote|strong|em|br)\b/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHTML(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function articleImage(article) {
  return imageUrl(article.imagen_destacada) || article.wp_imagen_original || "/assets/images/noticia-placeholder.jpg";
}

async function findArticle({ slug, documentId }) {
  if (slug) {
    const params = new URLSearchParams({
      slug,
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

async function relatedArticles(article) {
  const category = articleCategories(article)[0]?.slug;
  const params = new URLSearchParams({ pageSize: "4" });
  if (category) params.set("categoria", category);
  const response = await fetch(`${FRONTEND_API}/noticias?${params.toString()}`);
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.data || []).filter(item => item.slug !== article.slug).slice(0, 3);
}

function relatedCard(item) {
  const img = articleImage(item);
  const date = formatDate(item.fecha_publicacion || item.publishedAt);
  const category = articleCategories(item)[0]?.nombre || item.servicio || "Institucional";
  return `
    <article class="news-card">
      <a href="/noticia.html?slug=${encodeURIComponent(item.slug)}">
        <img class="news-image" src="${escapeHTML(img)}" alt="${escapeHTML(item.titulo || "Noticia COOPSAR")}">
        <div class="news-content">
          <div class="news-meta"><span>${escapeHTML(category)}</span>${date ? `<time>${escapeHTML(date)}</time>` : ""}</div>
          <h3>${escapeHTML(item.titulo || "Noticia institucional")}</h3>
          <p>${escapeHTML(item.resumen || "Novedad publicada por COOPSAR.")}</p>
          <span class="card-link">Leer mas</span>
        </div>
      </a>
    </article>
  `;
}

export async function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const container = document.getElementById("detalleNoticia");
  const relatedContainer = document.getElementById("noticiasRelacionadas");

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

    const img = articleImage(article);
    const date = formatDate(article.fecha_publicacion || article.publishedAt);
    const categories = articleCategories(article);
    const categoryLabel = categories.map(category => category.nombre).join(", ") || article.servicio || "Institucional";
    const currentUrl = window.location.href;
    const shareText = `${article.titulo} | COOPSAR`;
    document.title = `${article.titulo} | COOPSAR`;

    container.innerHTML = `
      <a href="/noticias" class="back-link">Volver a noticias</a>
      ${img ? `<img class="detail-image" src="${escapeHTML(img)}" alt="${escapeHTML(article.titulo)}">` : ""}
      <div class="detail-meta">
        <span class="detail-label">${escapeHTML(categoryLabel)}</span>
        ${date ? `<time>${escapeHTML(date)}</time>` : ""}
        ${article.autor ? `<span>Por ${escapeHTML(article.autor)}</span>` : ""}
      </div>
      <h1>${escapeHTML(article.titulo)}</h1>
      ${article.resumen ? `<p class="detail-summary">${escapeHTML(article.resumen)}</p>` : ""}
      <div class="detail-content">
        ${renderContent(article.contenido) || "<p>Esta noticia todavia no tiene contenido publicado.</p>"}
      </div>
      <div class="share-row">
        <a class="share-button" href="https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="share-button" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}" target="_blank" rel="noopener">Facebook</a>
        <button class="share-button" type="button" data-copy-link>Copiar enlace</button>
      </div>
    `;

    container.querySelector("[data-copy-link]")?.addEventListener("click", async (event) => {
      await navigator.clipboard.writeText(currentUrl);
      event.currentTarget.textContent = "Enlace copiado";
    });

    if (relatedContainer) {
      const related = await relatedArticles(article);
      relatedContainer.innerHTML = related.length ? `
        <div class="section-heading compact-heading"><div class="section-title"><span>Tambien puede interesarte</span><h2>Noticias relacionadas</h2></div></div>
        <div class="news-grid">${related.map(relatedCard).join("")}</div>
      ` : "";
    }
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
