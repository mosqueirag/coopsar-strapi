import { getCortesProgramados, getNoticias, getServicios, getTramites } from "./api.js";
import {
  contactItems,
  fallbackNews,
  fallbackOutages,
  fallbackProcedures,
  fallbackServices,
  quickLinks,
} from "./data.js";
import {
  contactCard,
  newsCard,
  outageItem,
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

async function withFallback(fetcher, fallback) {
  try {
    const data = await fetcher();
    return data.length ? data : fallback;
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

async function renderServices() {
  const data = await withFallback(getServicios, fallbackServices);
  setHTML("#servicesGrid", data.map(serviceCard).join(""));
}

async function renderProcedures() {
  const data = await withFallback(getTramites, fallbackProcedures);
  setHTML("#proceduresList", data.map(procedureItem).join(""));
}

async function renderOutages() {
  const data = await withFallback(getCortesProgramados, fallbackOutages);
  setHTML("#outagesList", data.map(outageItem).join(""));
}

async function renderNews(service = "") {
  const grid = document.getElementById("noticiasGrid");
  const count = document.getElementById("noticiasEstado");

  grid.innerHTML = `<p class="loading">Cargando noticias...</p>`;
  count.textContent = "";

  const data = await withFallback(() => getNoticias(service), service ? [] : fallbackNews);

  if (!data.length) {
    grid.innerHTML = `<p class="empty-state">No hay noticias publicadas para este servicio.</p>`;
    count.textContent = "Sin resultados";
    return;
  }

  grid.innerHTML = data.map(newsCard).join("");
  count.textContent = `${data.length} ${data.length === 1 ? "noticia" : "noticias"}`;
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
renderOutages();
renderNews();
