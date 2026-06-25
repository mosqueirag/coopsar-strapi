const FRONTEND_API = "/api/frontend";

async function fetchFrontendCollection(endpoint, params = {}) {
  const search = new URLSearchParams(params);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const response = await fetch(`${FRONTEND_API}/${endpoint}${suffix}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || `No se pudo cargar ${endpoint}.`);
  }

  return payload.data || [];
}

export async function getNoticias(servicio = "") {
  return fetchFrontendCollection("noticias", servicio ? { servicio } : {});
}

export async function getServicios() {
  return fetchFrontendCollection("servicios");
}

export async function getTramites() {
  return fetchFrontendCollection("tramites");
}

export async function getMediosDePago() {
  return fetchFrontendCollection("medios-de-pago");
}

export async function getCortesProgramados() {
  return fetchFrontendCollection("cortes-programados");
}

export async function getAlertasImportantes() {
  return fetchFrontendCollection("alertas-importantes");
}

export async function getPreguntasFrecuentes() {
  return fetchFrontendCollection("preguntas-frecuentes");
}
