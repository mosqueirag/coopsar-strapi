import { initAnimations, refreshAnimations } from "/assets/js/animations.js";

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
  alertas: [
    { titulo: "Alertas importantes", resumen: "Comunicados urgentes y novedades operativas se mostraran en este espacio.", tipo: "Aviso", enlace: ROUTES.OUTAGES_URL },
    { titulo: "Atencion por WhatsApp", resumen: "Canal directo para orientacion inicial y consultas frecuentes.", tipo: "Contacto", enlace: ROUTES.WHATSAPP_URL },
  ],
  preguntas: [
    { pregunta: "Donde consulto mi deuda?", respuesta: "Desde el acceso Consultar deuda o la Oficina Virtual cuando este configurada." },
    { pregunta: "Como informo un reclamo tecnico?", respuesta: "Ingresa a Reclamos tecnicos y completa los datos basicos del inconveniente." },
    { pregunta: "Donde veo cortes programados?", respuesta: "La seccion Cortes programados muestra avisos operativos publicados desde Strapi." },
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

function relationItems(value) {
  if (Array.isArray(value)) return value.map(item => item?.attributes ? { id: item.id, ...item.attributes } : item);
  if (Array.isArray(value?.data)) return value.data.map(item => item?.attributes ? { id: item.id, ...item.attributes } : item);
  return [];
}

function newsCategories(item) {
  return relationItems(item.categorias)
    .map(category => ({
      nombre: category.nombre || category.titulo || category.name,
      slug: category.slug || "",
    }))
    .filter(category => category.nombre);
}

function primaryCategory(item) {
  return newsCategories(item)[0]?.nombre || item.servicio || "Institucional";
}

async function fetchContent(endpoint, params = {}) {
  const search = new URLSearchParams(params);
  const suffix = search.toString() ? `?${search}` : "";
  const response = await fetch(`${ROUTES.STRAPI_URL}/${endpoint}${suffix}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `No se pudo cargar ${endpoint}`);
  return payload.data || [];
}

const contentApi = {
  list(endpoint, params = {}) {
    return fetchContent(endpoint, params);
  },
  noticias(params = {}) {
    return fetchContent("noticias", params);
  },
  categoriasNoticias() {
    return fetchContent("categorias-noticias");
  },
  servicios() {
    return fetchContent("servicios");
  },
  tramites() {
    return fetchContent("tramites");
  },
  cortesProgramados() {
    return fetchContent("cortes-programados");
  },
  mediosDePago() {
    return fetchContent("medios-de-pago");
  },
  alertasImportantes() {
    return fetchContent("alertas-importantes");
  },
  preguntasFrecuentes() {
    return fetchContent("preguntas-frecuentes");
  },
};

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
            <a class="nav-link" href="${group.links[0][1]}">${group.label}</a>
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
      <div><h3>Gestion</h3><a href="${ROUTES.PAYMENT_URL}">Facturas y pagos</a><a href="${ROUTES.DEBT_URL}">Consultar deuda</a><a href="/tramites">Tramites</a></div>
      <div><h3>Atencion</h3><a href="${ROUTES.CLAIMS_URL}">Reclamos tecnicos</a><a href="${ROUTES.OUTAGES_URL}">Cortes programados</a><a href="${ROUTES.CONTACT_URL}">Contacto</a></div>
      <div><h3>Comunidad</h3><a href="${ROUTES.NEWS_URL}">Noticias</a><a href="${ROUTES.ADECOOP_URL}">ADECOOP</a><a href="/institucional">Institucional</a><a href="${ROUTES.INSTAGRAM_URL}">Instagram</a></div>
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

  menu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
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
  const img = media?.formats?.medium?.url || media?.formats?.small?.url || media?.url || item.wp_imagen_original || "/assets/images/noticia-placeholder.jpg";
  return `<article class="news-card"><a href="${href}"><img class="news-image" src="${escapeHTML(img)}" alt="${escapeHTML(title)}"><div class="news-content"><div class="news-meta"><span>${escapeHTML(primaryCategory(item))}</span>${date ? `<time>${date}</time>` : ""}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(item.resumen || "Novedad publicada por COOPSAR.")}</p><span class="card-link">Leer mas</span></div></a></article>`;
}

function outageCard(item) {
  return `<article class="alert-banner" data-outage-item><span class="alert-mark">CP</span><div><strong>${escapeHTML(item.titulo || item.zona || "Corte programado")}</strong><p class="muted">${escapeHTML(item.descripcion || item.resumen || "Informacion operativa disponible desde Strapi.")}</p></div><a class="button-secondary" href="${ROUTES.OUTAGES_URL}">Ver</a></article>`;
}

function procedureCard(item, index) {
  return `<article class="step-card"><span class="step-number">${index + 1}</span><h3>${escapeHTML(item.titulo || item.nombre)}</h3><p>${escapeHTML(item.resumen || item.descripcion || "Guia y requisitos disponibles desde Strapi.")}</p></article>`;
}

function alertCard(item) {
  const title = item.titulo || item.nombre || "Alerta importante";
  const text = item.resumen || item.descripcion || item.detalle || "Informacion importante publicada por COOPSAR.";
  const href = item.enlace || item.url || ROUTES.OUTAGES_URL;
  const type = item.tipo || item.categoria || "AV";
  return `<article class="alert-banner"><span class="alert-mark">${escapeHTML(String(type).slice(0, 2).toUpperCase())}</span><div><strong>${escapeHTML(title)}</strong><p class="muted">${escapeHTML(text)}</p></div><a class="button-secondary" href="${escapeHTML(href)}">Ver</a></article>`;
}

function faqItem(item, index) {
  const question = item.pregunta || item.titulo || "Pregunta frecuente";
  const answer = item.respuesta || item.descripcion || item.contenido || "Respuesta administrable desde Strapi.";
  return `<article class="faq-item ${index === 0 ? "is-open" : ""}"><button class="faq-trigger" type="button" aria-expanded="${index === 0 ? "true" : "false"}">${escapeHTML(question)}<span>+</span></button><div class="faq-panel">${escapeHTML(answer)}</div></article>`;
}

async function renderRemote(selector, endpoint, renderer, fallbackItems, loadingText, emptyText) {
  const node = qs(selector);
  if (!node) return;
  node.innerHTML = loading(loadingText);
  try {
    const data = await fetchContent(endpoint);
    const items = data.length ? data : fallbackItems;
    node.innerHTML = items.length ? items.map(renderer).join("") : empty(emptyText);
    refreshAnimations(node);
  } catch (err) {
    console.warn(err);
    node.innerHTML = error("Revisa la conexion con Strapi, las variables de entorno y los permisos del token.");
    refreshAnimations(node);
  }
}

function matchesNewsSearch(item, term) {
  if (!term) return true;
  const categories = newsCategories(item).map(category => category.nombre).join(" ");
  const haystack = `${item.titulo || ""} ${item.resumen || ""} ${item.autor || ""} ${categories}`.toLowerCase();
  return haystack.includes(term);
}

function setupNewsSections() {
  qsa("[data-news-grid]").forEach(async grid => {
    const scope = grid.closest("section") || document;
    const categoryFilter = qs("[data-category-filter]", scope);
    const searchInput = qs("[data-news-search]", scope);
    const loadMoreButton = qs("[data-load-more]", scope);
    const pageSize = Number(grid.dataset.pageSize || 9);
    const state = { items: [], visible: pageSize };

    function filteredItems() {
      const category = categoryFilter?.value || "";
      const term = (searchInput?.value || "").trim().toLowerCase();
      return state.items
        .filter(item => !category || newsCategories(item).some(itemCategory => itemCategory.slug === category))
        .filter(item => matchesNewsSearch(item, term))
        .sort((a, b) => new Date(b.fecha_publicacion || b.publishedAt || 0) - new Date(a.fecha_publicacion || a.publishedAt || 0));
    }

    function render() {
      const items = filteredItems();
      const visibleItems = items.slice(0, state.visible);
      grid.innerHTML = visibleItems.length ? visibleItems.map(newsCard).join("") : empty("No hay noticias para esta busqueda.");
      if (loadMoreButton) loadMoreButton.hidden = visibleItems.length >= items.length;
      refreshAnimations(grid);
    }

    grid.innerHTML = loading("Cargando noticias...");

    try {
      const [items, categories] = await Promise.all([
        contentApi.noticias({ pageSize: 500 }),
        categoryFilter ? contentApi.categoriasNoticias().catch(() => []) : Promise.resolve([]),
      ]);
      state.items = items.length ? items : fallback.noticias;

      if (categoryFilter && categories.length) {
        categoryFilter.innerHTML = `<option value="">Todas las categorias</option>${categories.map(category => `<option value="${escapeHTML(category.slug)}">${escapeHTML(category.nombre)}</option>`).join("")}`;
      }

      categoryFilter?.addEventListener("change", () => {
        state.visible = pageSize;
        render();
      });
      searchInput?.addEventListener("input", () => {
        state.visible = pageSize;
        render();
      });
      loadMoreButton?.addEventListener("click", () => {
        state.visible += pageSize;
        render();
      });
      render();
    } catch (err) {
      console.warn(err);
      grid.innerHTML = error("No se pudieron cargar las noticias. Revisa la conexion con Strapi y los permisos del token.");
      refreshAnimations(grid);
    }
  });
}

function setupFilters() {
  const outageFilter = qs("[data-outage-filter]");
  if (outageFilter) {
    outageFilter.addEventListener("input", () => {
      const term = outageFilter.value.toLowerCase();
      qsa("[data-outage-item]").forEach(item => item.hidden = !item.textContent.toLowerCase().includes(term));
    });
  }
}

function setupFAQ() {
  qsa("[data-faq]").forEach(list => {
    list.addEventListener("click", event => {
      const button = event.target.closest(".faq-trigger");
      if (!button || !list.contains(button)) return;
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
  setupNewsSections();
  renderRemote("[data-outages-list]", "cortes-programados", outageCard, fallback.cortes, "Cargando cortes programados...", "No hay cortes programados.");
  renderRemote("[data-procedures-list]", "tramites", procedureCard, fallback.tramites, "Cargando tramites...", "No hay tramites publicados.");
  renderRemote("[data-payment-list]", "medios-de-pago", (item) => `<article class="card"><span class="small-label">${escapeHTML(item.tipo || "Medio de pago")}</span><h3>${escapeHTML(item.titulo || item.nombre)}</h3><p>${escapeHTML(item.resumen || item.descripcion || "Informacion administrable desde Strapi.")}</p></article>`, fallback.pagos, "Cargando medios de pago...", "No hay medios de pago publicados.");
  renderRemote("[data-alerts-list]", "alertas-importantes", alertCard, fallback.alertas, "Cargando alertas importantes...", "No hay alertas importantes publicadas.");
  renderRemote("[data-faq-list]", "preguntas-frecuentes", faqItem, fallback.preguntas, "Cargando preguntas frecuentes...", "No hay preguntas frecuentes publicadas.");
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
initAnimations();
