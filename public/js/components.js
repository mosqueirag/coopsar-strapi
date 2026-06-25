import { navSections } from "./data.js";
import { detailUrl, escapeHTML, formatDate, imageUrl } from "./utils.js";

export function renderHeader(container) {
  container.innerHTML = `
    <div class="topbar">
      <div class="container topbar-content">
        <span>Atencion cooperativa y servicios esenciales</span>
        <a href="#contacto">Canales de contacto</a>
      </div>
    </div>
    <div class="container header-content">
      <a class="brand" href="/" aria-label="Ir al inicio">
        <span class="brand-icon">C</span>
        <span>
          <strong>COOPSAR</strong>
          <small>Cooperativa de Sarmiento</small>
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mainNav">Menu</button>
      <nav id="mainNav" class="nav" aria-label="Navegacion principal">
        ${navSections.map((section) => `
          <div class="nav-item">
            <a href="${section.href}">${section.label}</a>
            <div class="mega-menu">
              ${section.items.map((item) => `
                <a href="${item.href}">
                  <strong>${item.label}</strong>
                  <span>${item.description}</span>
                </a>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </nav>
    </div>
  `;

  const toggle = container.querySelector(".menu-toggle");
  const nav = container.querySelector("#mainNav");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

export function renderFooter(container) {
  container.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="brand footer-brand" href="/">
          <span class="brand-icon">C</span>
          <span>
            <strong>COOPSAR</strong>
            <small>Sarmiento, Chubut</small>
          </span>
        </a>
        <p>Servicios cooperativos, informacion institucional y canales de atencion.</p>
      </div>
      <div>
        <h3>Servicios</h3>
        <a href="#servicios">Energia</a>
        <a href="#servicios">Telecomunicaciones</a>
        <a href="#servicios">Sepelio</a>
      </div>
      <div>
        <h3>Gestion</h3>
        <a href="#facturas">Facturas y pagos</a>
        <a href="#tramites">Tramites</a>
        <a href="#reclamos">Reclamos tecnicos</a>
      </div>
      <div>
        <h3>Institucional</h3>
        <a href="#noticias">Noticias</a>
        <a href="#adecoop">ADECOOP</a>
        <a href="#contacto">Contacto</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>COOPSAR - Sitio institucional</span>
      <span>Contenido administrable desde Strapi</span>
    </div>
  `;
}

export function quickCard(item) {
  return `
    <a class="quick-card" href="${item.href}">
      <strong>${escapeHTML(item.label)}</strong>
      <span>${escapeHTML(item.text)}</span>
    </a>
  `;
}

export function serviceCard(item) {
  return `
    <article class="feature-card">
      <span>${escapeHTML(item.slug || item.categoria || "Servicio")}</span>
      <h3>${escapeHTML(item.titulo || item.nombre)}</h3>
      <p>${escapeHTML(item.resumen || item.descripcion || "")}</p>
      <a href="#contacto">Consultar</a>
    </article>
  `;
}

export function procedureItem(item) {
  return `
    <article class="list-item">
      <span>${escapeHTML(item.categoria || "Tramite")}</span>
      <div>
        <h3>${escapeHTML(item.titulo || item.nombre)}</h3>
        <p>${escapeHTML(item.resumen || item.descripcion || "")}</p>
      </div>
      <a href="#contacto">Iniciar</a>
    </article>
  `;
}

export function paymentMethodItem(item) {
  return `
    <article class="payment-method">
      <strong>${escapeHTML(item.titulo || item.nombre || "Medio de pago")}</strong>
      <span>${escapeHTML(item.tipo || item.categoria || "Disponible")}</span>
      <p>${escapeHTML(item.resumen || item.descripcion || "Informacion administrable desde Strapi.")}</p>
    </article>
  `;
}

export function outageItem(item) {
  const date = formatDate(item.fecha || item.fecha_inicio);
  return `
    <article class="outage-item">
      <strong>${escapeHTML(item.titulo || item.zona || "Aviso operativo")}</strong>
      <span>${escapeHTML(date || item.zona || "Fecha a confirmar")}</span>
      <p>${escapeHTML(item.descripcion || item.resumen || "")}</p>
    </article>
  `;
}

export function newsCard(item) {
  const img = imageUrl(item.imagen_destacada);
  const date = formatDate(item.fecha_publicacion || item.publishedAt);
  return `
    <article class="news-card">
      <a class="news-card-link" href="${detailUrl(item)}">
        ${img ? `<img class="news-image" src="${escapeHTML(img)}" alt="${escapeHTML(item.titulo)}" loading="lazy">` : `<div class="news-image news-image-placeholder">COOPSAR</div>`}
        <div class="news-card-content">
          <div class="news-meta">
            <span>${escapeHTML(item.servicio || "Institucional")}</span>
            ${date ? `<time>${escapeHTML(date)}</time>` : ""}
          </div>
          <h3>${escapeHTML(item.titulo)}</h3>
          <p>${escapeHTML(item.resumen || "Comunicado institucional de COOPSAR.")}</p>
          <span class="card-link">Leer mas</span>
        </div>
      </a>
    </article>
  `;
}

export function contactCard(item) {
  return `
    <article class="contact-card">
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.text)}</p>
      <a href="#">${escapeHTML(item.action)}</a>
    </article>
  `;
}
