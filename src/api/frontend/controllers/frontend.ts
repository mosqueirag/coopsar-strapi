type QueryParams = Record<string, string | number | boolean | undefined>;

const DEFAULT_API_URL = 'http://localhost:1337';

function apiBaseUrl() {
  return (process.env.STRAPI_URL || process.env.STRAPI_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
}

function apiHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const token = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function buildUrl(collection: string, params: QueryParams = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return `${apiBaseUrl()}/api/${collection}?${search.toString()}`;
}

async function fetchCollection(collection: string, params: QueryParams = {}) {
  const response = await fetch(buildUrl(collection, params), {
    headers: apiHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${collection} ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as { data?: unknown[]; meta?: unknown };
  return {
    data: payload.data || [],
    meta: payload.meta || {},
  };
}

async function sendCollection(ctx, collection: string, params: QueryParams = {}) {
  try {
    ctx.body = await fetchCollection(collection, params);
  } catch (error) {
    console.error(error);
    ctx.status = 502;
    ctx.body = {
      data: [],
      error: {
        message: `No se pudo consultar ${collection} desde Strapi.`,
      },
    };
  }
}

export default {
  async noticias(ctx) {
    const servicio = ctx.query?.servicio;
    const categoria = ctx.query?.categoria;
    const slug = ctx.query?.slug || ctx.query?.filters?.slug?.$eq;

    await sendCollection(ctx, 'noticias', {
      'sort[0]': 'fecha_publicacion:desc',
      'sort[1]': 'publishedAt:desc',
      'populate[imagen_destacada]': 'true',
      'populate[categorias]': 'true',
      'pagination[pageSize]': ctx.query?.pageSize || 24,
      'filters[servicio][$eq]': typeof servicio === 'string' ? servicio : undefined,
      'filters[categorias][slug][$eq]': typeof categoria === 'string' ? categoria : undefined,
      'filters[slug][$eq]': typeof slug === 'string' ? slug : undefined,
    });
  },

  async categoriasNoticias(ctx) {
    await sendCollection(ctx, 'categorias-noticias', {
      'sort[0]': 'nombre:asc',
      'pagination[pageSize]': 100,
    });
  },

  async servicios(ctx) {
    await sendCollection(ctx, 'servicios', {
      'sort[0]': 'orden:asc',
      'sort[1]': 'titulo:asc',
      populate: '*',
      'pagination[pageSize]': 12,
    });
  },

  async tramites(ctx) {
    await sendCollection(ctx, 'tramites', {
      'sort[0]': 'orden:asc',
      'sort[1]': 'titulo:asc',
      populate: '*',
      'pagination[pageSize]': 12,
    });
  },

  async mediosDePago(ctx) {
    await sendCollection(ctx, 'medios-de-pagos', {
      'sort[0]': 'orden:asc',
      'sort[1]': 'titulo:asc',
      populate: '*',
      'pagination[pageSize]': 12,
    });
  },

  async cortesProgramados(ctx) {
    await sendCollection(ctx, 'cortes-programados', {
      'sort[0]': 'fecha:asc',
      populate: '*',
      'pagination[pageSize]': 8,
    });
  },

  async alertasImportantes(ctx) {
    await sendCollection(ctx, 'alertas-importantes', {
      'sort[0]': 'prioridad:desc',
      'sort[1]': 'publishedAt:desc',
      populate: '*',
      'pagination[pageSize]': 6,
    });
  },

  async preguntasFrecuentes(ctx) {
    await sendCollection(ctx, 'preguntas-frecuentes', {
      'sort[0]': 'orden:asc',
      'sort[1]': 'pregunta:asc',
      populate: '*',
      'pagination[pageSize]': 12,
    });
  },
};
