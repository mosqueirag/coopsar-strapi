const ROUTES = {
  OFFICE_URL: "/oficina-virtual",
  WHATSAPP_URL: "https://wa.me/5492970000000",
  PAYMENT_URL: "/facturas-y-pagos",
  FACEBOOK_URL: "https://www.facebook.com/",
  INSTAGRAM_URL: "https://www.instagram.com/",
  STRAPI_URL: "/api/frontend",
  DEBT_URL: "/consultar-deuda",
  CLAIMS_URL: "/reclamos",
  OUTAGES_URL: "/cortes-programados",
  NEWS_URL: "/noticias",
  ADECOOP_URL: "/adecoop",
  CONTACT_URL: "/contacto",
};

const navGroups = [
  {
    label: "Servicios",
    intro: "Gestion y consultas sobre prestaciones de COOPSAR.",
    links: [
      ["Servicios", "/servicios", "Energia, telecomunicaciones y sepelio."],
      ["Facturas y pagos", ROUTES.PAYMENT_URL, "Medios de pago y consultas."],
      ["Oficina Virtual", ROUTES.OFFICE_URL, "Autogestion y solicitudes."],
      ["Consultar deuda", ROUTES.DEBT_URL, "Acceso rapido a estado de cuenta."],
    ],
  },
  {
    label: "Atencion",
    intro: "Canales para resolver tramites e incidencias.",
    links: [
      ["Tramites", "/tramites", "Guia paso a paso."],
      ["Reclamos tecnicos", ROUTES.CLAIMS_URL, "Inconvenientes de servicio."],
      ["Cortes programados", ROUTES.OUTAGES_URL, "Alertas operativas."],
      ["Contacto", ROUTES.CONTACT_URL, "Telefonos, horarios y ubicacion."],
    ],
  },
  {
    label: "Institucional",
    intro: "Informacion de la cooperativa y comunidad.",
    links: [
      ["Noticias", ROUTES.NEWS_URL, "Novedades y comunicados."],
      ["ADECOOP", ROUTES.ADECOOP_URL, "Beneficios y actividades."],
      ["Institucional", "/institucional", "Gestion y valores."],
      ["Redes sociales", ROUTES.FACEBOOK_URL, "Canales digitales."],
    ],
  },
];

const quickLinks = [
  ["PF", "Paga tu factura", ROUTES.PAYMENT_URL],
  ["CD", "Consulta tu deuda", ROUTES.DEBT_URL],
  ["CP", "Cortes programados", ROUTES.OUTAGES_URL],
  ["RT", "Reclamos tecnicos", ROUTES.CLAIMS_URL],
  ["TR", "Tramites", "/tramites"],
  ["OV", "Oficina Virtual", ROUTES.OFFICE_URL],
  ["NO", "Noticias", ROUTES.NEWS_URL],
  ["AD", "ADECOOP", ROUTES.ADECOOP_URL],
];

const searchSuggestions = [
  ["Pagar factura", ROUTES.PAYMENT_URL, ["pago", "factura", "abonar"]],
  ["Consultar deuda", ROUTES.DEBT_URL, ["deuda", "cuenta", "saldo"]],
  ["Reclamos tecnicos", ROUTES.CLAIMS_URL, ["reclamo", "sin luz", "internet", "tecnico"]],
  ["Cortes programados", ROUTES.OUTAGES_URL, ["corte", "cortes", "programado"]],
  ["Tramites", "/tramites", ["tramite", "alta", "baja", "titular"]],
  ["Servicios", "/servicios", ["servicio", "energia", "sepelio"]],
  ["Noticias", ROUTES.NEWS_URL, ["noticia", "comunicado"]],
  ["Contacto", ROUTES.CONTACT_URL, ["contacto", "telefono", "direccion"]],
];

const fallback = {
  servicios: [
    ["energia.jpg", "Energia", "Informacion de suministro electrico, guardias, conexiones y consultas operativas."],
    ["internet.jpg", "Telecomunicaciones", "Conectividad, soporte tecnico y novedades del servicio."],
    ["sepelio.jpg", "Sepelio", "Acompanamiento, consultas administrativas y canales de atencion."],
  ],
  noticias: [
    { titulo: "Nuevo portal institucional de COOPSAR", resumen: "Un espacio digital para centralizar informacion, tramites y novedades.", servicio: "Institucional", slug: "nuevo-portal", fecha_publicacion: new Date().toISOString() },
  ],
  cortes: [
    { titulo: "Sin cortes programados informados", zona: "Sarmiento", descripcion: "Las alertas operativas publicadas desde Strapi apareceran en este modulo." },
  ],
  tramites: [
    { titulo: "Alta de servicio", categoria: "Servicios", resumen: "Conoce los requisitos y canales para iniciar una solicitud." },
    { titulo: "Cambio de titularidad", categoria: "Administracion", resumen: "Actualizacion de datos del titular de una cuenta o suministro." },
    { titulo: "Consulta de factura", categoria: "Facturacion", resumen: "Orientacion para revisar vencimientos y medios de pago." },
  ],
  pagos: [
    { titulo: "Medios digitales", tipo: "Pago", resumen: "Modulo preparado para mostrar medios habilitados desde Strapi." },
  ],
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHTML(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}

async function fetchContent(endpoint, params = {}) {
  const search = new URLSearchParams(params);
  const suffix = search.toString() ? `?${search}` : "";
  const response = await fetch(`${ROUTES.STRAPI_URL}/${endpoint}${suffix}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `No se pudo cargar ${endpoint}`);
  return payload.data || [];
}

function loading(message) {
  return `<p class="loading">${message}</p>`;
}

function empty(message) {
  return `<p class="empty-state">${message}</p>`;
}

function error(message) {
  return `<div class="empty-state error-state"><strong>No se pudo cargar esta seccion.</strong><p>${message}</p></div>`;
}

function renderHeader() {
  const header = qs("[data-header]");
  if (!header) return;
  header.innerHTML = `
    <div class="topbar"><div class="container"><span>Portal institucional y autogestion</span><a href="${ROUTES.WHATSAPP_URL}">WhatsApp</a></div></div>
    <div class="container header-inner">
      <a class="brand" href="/"><span class="brand-mark">C</span><span><strong>COOPSAR</strong><span>Cooperativa de Sarmiento</span></span></a>
      <nav class="desktop-nav" aria-label="Navegacion principal">
        ${navGroups.map(group => `
          <div class="nav-item">
            <a class="nav-link" href="#">${group.label}</a>
            <div class="mega-menu">
              <div class="mega-feature"><strong>${group.label}</strong><span>${group.intro}</span></div>
              <div class="mega-links">${group.links.map(([label, href, text]) => `<a href="${href}"><strong>${label}</strong><span>${text}</span></a>`).join("")}</div>
            </div>
          </div>
        `).join("")}
      </nav>
      <div class="header-actions">
        <a class="button" href="${ROUTES.OFFICE_URL}">Oficina Virtual</a>
        <button class="icon-button mobile-toggle" type="button" aria-expanded="false">Menu</button>
      </div>
    </div>
    <div class="mobile-menu"><div class="container"><nav>${navGroups.flatMap(group => group.links).map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav></div></div>
  `;
}

function renderFooter() {
  const footer = qs("[data-footer]");
  if (!footer) return;
  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="brand" href="/"><span class="brand-mark">C</span><span><strong>COOPSAR</strong><span>Sarmiento, Chubut</span></span></a>
        <p>Servicios cooperativos, canales de atencion y autogestion para la comunidad.</p>
        <form class="newsletter" data-newsletter><input type="email" placeholder="Tu email" required><button class="button" type="submit">Suscribirme</button></form>
        <p class="form-message" data-newsletter-message></p>
      </div>
      <div><h3>Gestion</h3><a href="${ROUTES.PAYMENT_URL}">Facturas y pagos</a><a href="${ROUTES.DEBT_URL}">Consultar deuda</a><a href="/tramites.html">Tramites</a></div>
      <div><h3>Atencion</h3><a href="${ROUTES.CLAIMS_URL}">Reclamos tecnicos</a><a href="${ROUTES.OUTAGES_URL}">Cortes programados</a><a href="${ROUTES.CONTACT_URL}">Contacto</a></div>
      <div><h3>Comunidad</h3><a href="${ROUTES.NEWS_URL}">Noticias</a><a href="${ROUTES.ADECOOP_URL}">ADECOOP</a><a href="/institucional.html">Institucional</a><a href="${ROUTES.INSTAGRAM_URL}">Instagram</a></div>
    </div>
    <div class="container footer-bottom"><span>COOPSAR - Sitio institucional</span><span>Contenido conectado a Strapi</span></div>
  `;
}

function setupMobileMenu() {
  const toggle = qs(".mobile-toggle");
  const menu = qs(".mobile-menu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function setupHelpSearch() {
  qsa("[data-help-search]").forEach(form => {
    const input = qs("input", form);
    const list = qs("[data-suggestions]", form);
    const render = () => {
      const term = input.value.trim().toLowerCase();
      const matches = searchSuggestions.filter(([label, , terms]) => !term || label.toLowerCase().includes(term) || terms.some(t => t.includes(term) || term.includes(t))).slice(0, 5);
      list.innerHTML = matches.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
      list.classList.toggle("is-open", matches.length > 0 && document.activeElement === input);
    };
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const term = input.value.trim().toLowerCase();
      const match = searchSuggestions.find(([, , terms]) => terms.some(t => term.includes(t)));
      window.location.href = match?.[1] || "/tramites";
    });
    document.addEventListener("click", event => {
      if (!form.contains(event.target)) list.classList.remove("is-open");
    });
  });
}

function renderQuickLinks() {
  qsa("[data-quick-links]").forEach(node => {
    node.innerHTML = quickLinks.map(([icon, label, href]) => `<a class="quick-card" href="${href}"><span class="quick-icon">${icon}</span><strong>${label}</strong></a>`).join("");
  });
}

function serviceCard(item, index = 0) {
  const image = item.imagen || `/assets/images/${fallback.servicios[index % fallback.servicios.length][0]}`;
  const title = item.titulo || item.nombre || fallback.servicios[index % fallback.servicios.length][1];
  const text = item.resumen || item.descripcion || fallback.servicios[index % fallback.servicios.length][2];
  return `<article class="card"><img src="${image}" alt="${escapeHTML(title)}"><span class="small-label">Servicio</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p><div class="button-row"><a class="button-secondary" href="/servicios">Ver detalle</a></div></article>`;
}

function newsCard(item) {
  const title = item.titulo || "Noticia institucional";
  const date = formatDate(item.fecha_publicacion || item.publishedAt);
  const href = item.slug ? `/noticia.html?slug=${encodeURIComponent(item.slug)}` : "/noticias";
  const media = item.imagen_destacada;
  const img = media?.formats?.medium?.url || media?.formats?.small?.url || media?.url || "/assets/images/noticia-placeholder.jpg";
  return `<article class="news-card"><a href="${href}"><img class="news-image" src="${img}" alt="${escapeHTML(title)}"><div class="news-content"><div class="news-meta"><span>${escapeHTML(item.servicio || "Institucional")}</span>${date ? `<time>${date}</time>` : ""}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(item.resumen || "Novedad publicada por COOPSAR.")}</p><span class="card-link">Leer mas</span></div></a></article>`;
}

function outageCard(item) {
  return `<article class="alert-banner" data-outage-item><span class="alert-mark">CP</span><div><strong>${escapeHTML(item.titulo || item.zona || "Corte programado")}</strong><p class="muted">${escapeHTML(item.descripcion || item.resumen || "Informacion operativa disponible desde Strapi.")}</p></div><a class="button-secondary" href="${ROUTES.OUTAGES_URL}">Ver</a></article>`;
}

function procedureCard(item, index) {
  return `<article class="step-card"><span class="step-number">${index + 1}</span><h3>${escapeHTML(item.titulo || item.nombre)}</h3><p>${escapeHTML(item.resumen || item.descripcion || "Guia y requisitos disponibles desde Strapi.")}</p></article>`;
}

async function renderRemote(selector, endpoint, renderer, fallbackItems, loadingText, emptyText) {
  const node = qs(selector);
  if (!node) return;
  node.innerHTML = loading(loadingText);
  try {
    const data = await fetchContent(endpoint);
    const items = data.length ? data : fallbackItems;
    node.innerHTML = items.length ? items.map(renderer).join("") : empty(emptyText);
  } catch (err) {
    console.warn(err);
    node.innerHTML = error("Revisa la conexion con Strapi, las variables de entorno y los permisos del token.");
  }
}

function setupFilters() {
  const newsFilter = qs("[data-news-filter]");
  if (newsFilter) {
    newsFilter.addEventListener("change", async () => {
      const grid = qs("[data-news-grid]");
      grid.innerHTML = loading("Cargando noticias...");
      try {
        const data = await fetchContent("noticias", newsFilter.value ? { servicio: newsFilter.value } : {});
        grid.innerHTML = data.length ? data.map(newsCard).join("") : empty("No hay noticias para este filtro.");
      } catch {
        grid.innerHTML = error("No se pudieron cargar las noticias.");
      }
    });
  }
  const outageFilter = qs("[data-outage-filter]");
  if (outageFilter) {
    outageFilter.addEventListener("input", () => {
      const term = outageFilter.value.toLowerCase();
      qsa("[data-outage-item]").forEach(item => item.hidden = !item.textContent.toLowerCase().includes(term));
    });
  }
}

function setupFAQ() {
  qsa("[data-faq] .faq-trigger").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  });
}

function setupForms() {
  qsa("[data-contact-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const message = qs(".form-message", form);
      const valid = qsa("input, textarea", form).every(input => input.checkValidity());
      message.textContent = valid ? "Gracias. Tu consulta quedo lista para ser enviada por el canal configurado." : "Completa los campos requeridos.";
      if (valid) form.reset();
    });
  });
  qsa("[data-newsletter]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const msg = qs("[data-newsletter-message]") || form.nextElementSibling;
      msg.textContent = "Gracias por suscribirte.";
      form.reset();
    });
  });
}

function setupShareButtons() {
  qsa("[data-share]").forEach(button => {
    button.addEventListener("click", async () => {
      const data = { title: document.title, url: window.location.href };
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        button.textContent = "Link copiado";
      }
    });
  });
}

function renderStaticModules() {
  renderQuickLinks();
  renderRemote("[data-services-grid]", "servicios", serviceCard, fallback.servicios.map(([imagen, titulo, resumen]) => ({ imagen: `/assets/images/${imagen}`, titulo, resumen })), "Cargando servicios...", "No hay servicios publicados.");
  renderRemote("[data-news-grid]", "noticias", newsCard, fallback.noticias, "Cargando noticias...", "No hay noticias publicadas.");
  renderRemote("[data-outages-list]", "cortes-programados", outageCard, fallback.cortes, "Cargando cortes programados...", "No hay cortes programados.");
  renderRemote("[data-procedures-list]", "tramites", procedureCard, fallback.tramites, "Cargando tramites...", "No hay tramites publicados.");
  renderRemote("[data-payment-list]", "medios-de-pago", (item) => `<article class="card"><span class="small-label">${escapeHTML(item.tipo || "Medio de pago")}</span><h3>${escapeHTML(item.titulo || item.nombre)}</h3><p>${escapeHTML(item.resumen || item.descripcion || "Informacion administrable desde Strapi.")}</p></article>`, fallback.pagos, "Cargando medios de pago...", "No hay medios de pago publicados.");
}

renderHeader();
renderFooter();
setupMobileMenu();
setupHelpSearch();
renderStaticModules();
setupFilters();
setupFAQ();
setupForms();
setupShareButtons();
