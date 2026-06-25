const API_BASE = "";

async function fetchCollection(endpoint, params = {}) {
  const search = new URLSearchParams(params);
  const response = await fetch(`${API_BASE}/api/${endpoint}?${search.toString()}`);

  if (!response.ok) {
    throw new Error(`Strapi ${endpoint}: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data || [];
}

export async function getNoticias(servicio = "") {
  const params = {
    "sort[0]": "fecha_publicacion:desc",
    "sort[1]": "publishedAt:desc",
    populate: "imagen_destacada",
    "pagination[pageSize]": "6",
  };

  if (servicio) params["filters[servicio][$eq]"] = servicio;
  return fetchCollection("noticias", params);
}

export async function getServicios() {
  return fetchCollection("servicios", {
    "sort[0]": "orden:asc",
    "sort[1]": "titulo:asc",
    populate: "*",
  });
}

export async function getTramites() {
  return fetchCollection("tramites", {
    "sort[0]": "orden:asc",
    "sort[1]": "titulo:asc",
    populate: "*",
  });
}

export async function getCortesProgramados() {
  return fetchCollection("cortes-programados", {
    "sort[0]": "fecha:asc",
    populate: "*",
  });
}
