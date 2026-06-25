import { getCortesProgramados, getMediosDePago, getNoticias, getServicios, getTramites } from "./api.js";
import {
  contactItems,
  quickLinks,
} from "./data.js";
import {
  contactCard,
  newsCard,
  outageItem,
  paymentMethodItem,
  procedureItem,
  quickCard,
  renderFooter,
  renderHeader,
  serviceCard,
} from "./components.js";

const services = ["Energia", "Telecomunicaciones", "Sepelio", "Institucional", "ADECOOP"];

function setHTML(selector, html) {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = html;
}

function loadingHTML(message) {
  return `<p class="loading">${message}</p>`;
}

function emptyHTML(message) {
  return `<p class="empty-state">${message}</p>`;
}

function errorHTML(message) {
  return `
    <div class="empty-state error-state">
      <strong>No se pudo cargar esta seccion.</strong>
      <p>${message}</p>
    </div>
  `;
}

async function renderRemoteSection({ selector, loader, renderItem, loading, empty, error }) {
  const node = document.querySelector(selector);
  if (!node) return [];

  node.innerHTML = loadingHTML(loading);

  try {
    const data = await loader();

    if (!data.length) {
      node.innerHTML = emptyHTML(empty);
      return [];
    }

    node.innerHTML = data.map(renderItem).join("");
    return data;
  } catch (err) {
    console.warn(err);
    node.innerHTML = errorHTML(error || err.message || "Revisa la conexion con Strapi.");
    return [];
  }
}

function renderStaticBlocks() {
  renderHeader(document.getElementById("siteHeader"));
  renderFooter(document.getElementById("siteFooter"));
  setHTML("#heroQuickLinks", quickLinks.slice(0, 3).map(quickCard).join(""));
  setHTML("#quickAccessGrid", quickLinks.map(quickCard).join(""));
  setHTML("#contactCards", contactItems.map(contactCard).join(""));

  const filter = document.getElementById("servicioFiltro");
  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    filter.appendChild(option);
  });
  filter.addEventListener("change", () => renderNews(filter.value));
}

async function renderServices() {
  await renderRemoteSection({
    selector: "#servicesGrid",
    loader: getServicios,
    renderItem: serviceCard,
    loading: "Cargando servicios...",
    empty: "Todavia no hay servicios publicados.",
    error: "Configura el content-type servicios o revisa STRAPI_API_URL y STRAPI_API_TOKEN.",
  });
}

async function renderProcedures() {
  await renderRemoteSection({
    selector: "#proceduresList",
    loader: getTramites,
    renderItem: procedureItem,
    loading: "Cargando tramites...",
    empty: "Todavia no hay tramites publicados.",
    error: "Configura el content-type tramites o revisa los permisos del token.",
  });
}

async function renderPaymentMethods() {
  await renderRemoteSection({
    selector: "#paymentMethodsList",
    loader: getMediosDePago,
    renderItem: paymentMethodItem,
    loading: "Cargando medios de pago...",
    empty: "Todavia no hay medios de pago publicados.",
    error: "Configura el content-type medios-de-pagos o revisa los permisos del token.",
  });
}

async function renderOutages() {
  await renderRemoteSection({
    selector: "#outagesList",
    loader: getCortesProgramados,
    renderItem: outageItem,
    loading: "Cargando cortes programados...",
    empty: "No hay cortes programados informados.",
    error: "Configura el content-type cortes-programados o revisa los permisos del token.",
  });
}

async function renderNews(service = "") {
  const grid = document.getElementById("noticiasGrid");
  const count = document.getElementById("noticiasEstado");

  grid.innerHTML = loadingHTML("Cargando noticias...");
  count.textContent = "";

  try {
    const data = await getNoticias(service);

    if (!data.length) {
      grid.innerHTML = emptyHTML(service ? "No hay noticias publicadas para este servicio." : "Todavia no hay noticias publicadas.");
      count.textContent = "Sin resultados";
      return;
    }

    grid.innerHTML = data.map(newsCard).join("");
    count.textContent = `${data.length} ${data.length === 1 ? "noticia" : "noticias"}`;
  } catch (error) {
    console.warn(error);
    grid.innerHTML = errorHTML("Revisa la conexion con Strapi y los permisos de lectura para noticias.");
    count.textContent = "Error";
  }
}

function setupSearch() {
  const form = document.getElementById("helpSearch");
  const input = document.getElementById("helpInput");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim().toLowerCase();

    const routes = [
      { terms: ["factura", "pago", "deuda"], target: "#facturas" },
      { terms: ["reclamo", "tecnico", "corte", "sin luz", "internet"], target: "#reclamos" },
      { terms: ["tramite", "alta", "baja", "titular"], target: "#tramites" },
      { terms: ["noticia", "comunicado"], target: "#noticias" },
      { terms: ["adecoop", "beneficio"], target: "#adecoop" },
    ];

    const match = routes.find((route) => route.terms.some((term) => query.includes(term)));
    window.location.hash = match?.target || "#quickTitle";
  });
}

renderStaticBlocks();
setupSearch();
renderServices();
renderProcedures();
renderPaymentMethods();
renderOutages();
renderNews();
