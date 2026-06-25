#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { File } = require("buffer");

const DEFAULT_XML = path.resolve(process.cwd(), "data", "wordpress", "export.xml");
const PLACEHOLDER_IMAGE = "/assets/images/noticia-placeholder.jpg";

const args = new Set(process.argv.slice(2));
const xmlArg = process.argv.find((arg) => arg.startsWith("--xml="));
const xmlPath = path.resolve(xmlArg ? xmlArg.split("=").slice(1).join("=") : process.env.WP_XML_PATH || DEFAULT_XML);
const dryRun = args.has("--dry-run");
const skipImages = args.has("--skip-images");

const STRAPI_URL = (process.env.STRAPI_URL || process.env.STRAPI_API_URL || "http://localhost:1337").replace(/\/$/, "");
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN;

if (!dryRun && !STRAPI_TOKEN) {
  console.error("Falta STRAPI_TOKEN. Usalo en .env/entorno o ejecuta con --dry-run.");
  process.exit(1);
}

function cdata(value = "") {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'");
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`));
  return match ? decodeEntities(cdata(match[1].trim())) : "";
}

function slugify(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "sin-titulo";
}

function itemBlocks(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
}

function postMeta(item) {
  const result = {};
  const metas = [...item.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)];
  for (const [, meta] of metas) {
    const key = tag(meta, "wp:meta_key");
    const value = tag(meta, "wp:meta_value");
    if (key) result[key] = value;
  }
  return result;
}

function categories(item) {
  const found = [...item.matchAll(/<category\s+([^>]*)>([\s\S]*?)<\/category>/g)]
    .map(([, attrs, body]) => {
      if (!attrs.includes('domain="category"')) return null;
      const nicename = attrs.match(/nicename="([^"]+)"/)?.[1] || "";
      const name = decodeEntities(cdata(body.trim()));
      return {
        nombre: name || "General",
        slug: slugify(nicename || name || "general"),
        wp_slug_original: nicename || slugify(name || "general"),
      };
    })
    .filter(Boolean);

  return found.length ? found : [{ nombre: "General", slug: "general", wp_slug_original: "general" }];
}

function firstImageFromContent(content = "") {
  return content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || "";
}

function isoDate(value = "") {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function stripShortcodes(content = "") {
  return content
    .replace(/\[\/?fusion_[^\]]*\]/gi, "\n")
    .replace(/\[\/?[a-z0-9_-]+(?:\s+[^\]]*)?\]/gi, "\n");
}

function cleanContent(content = "") {
  let html = decodeEntities(content);
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = stripShortcodes(html);
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/\s(on[a-z]+)=["'][^"']*["']/gi, "");
  html = html.replace(/<\/?(div|span|font|section|article|tbody|table|tr|td)[^>]*>/gi, "\n");
  html = html.replace(/<([a-z0-9]+)(\s[^>]*)?>/gi, (full, tagName, attrs = "") => {
    const tag = tagName.toLowerCase();
    if (!["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "img", "strong", "em", "blockquote", "br"].includes(tag)) {
      return "";
    }
    if (tag === "a") {
      const href = attrs.match(/\shref=["']([^"']+)["']/i)?.[1] || "#";
      return `<a href="${href}">`;
    }
    if (tag === "img") {
      const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1] || "";
      const alt = attrs.match(/\salt=["']([^"']*)["']/i)?.[1] || "";
      return src ? `<img src="${src}" alt="${alt}">` : "";
    }
    return `<${tag}>`;
  });
  html = html.replace(/<\/([a-z0-9]+)>/gi, (full, tagName) => {
    const tag = tagName.toLowerCase();
    return ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "blockquote"].includes(tag) ? `</${tag}>` : "";
  });
  html = html.replace(/\n{3,}/g, "\n\n").trim();

  if (!/<p|<h|<ul|<ol|<blockquote|<img/i.test(html)) {
    html = html
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("\n");
  }

  return html || "<p>Contenido importado desde WordPress.</p>";
}

function plainText(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function attachmentMap(items) {
  const map = new Map();
  for (const item of items) {
    if (tag(item, "wp:post_type") !== "attachment") continue;
    const id = tag(item, "wp:post_id");
    const url = tag(item, "wp:attachment_url") || tag(item, "guid");
    if (id && url) map.set(id, url);
  }
  return map;
}

function parsePosts(xml) {
  const items = itemBlocks(xml);
  const attachments = attachmentMap(items);
  const posts = [];

  for (const item of items) {
    if (tag(item, "wp:post_type") !== "post") continue;
    if (tag(item, "wp:status") !== "publish") continue;

    const meta = postMeta(item);
    const rawContent = tag(item, "content:encoded");
    const contenido = cleanContent(rawContent);
    const thumbnailId = meta._thumbnail_id;
    const firstImage = firstImageFromContent(rawContent);
    const imageUrl = (thumbnailId && attachments.get(thumbnailId)) || firstImage || PLACEHOLDER_IMAGE;
    const title = tag(item, "title") || "Sin titulo";
    const wpId = Number(tag(item, "wp:post_id"));

    posts.push({
      wp_id_original: Number.isFinite(wpId) ? wpId : undefined,
      titulo: title,
      slug: slugify(tag(item, "wp:post_name") || title),
      fecha_publicacion: isoDate(tag(item, "wp:post_date_gmt") || tag(item, "pubDate")),
      autor: tag(item, "dc:creator"),
      contenido,
      resumen: tag(item, "excerpt:encoded") || plainText(contenido).slice(0, 240),
      categorias: categories(item),
      wp_url_original: tag(item, "link"),
      wp_imagen_original: imageUrl,
      imageUrl,
    });
  }

  return posts;
}

function headers(json = true) {
  const base = STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {};
  return json ? { ...base, "Content-Type": "application/json" } : base;
}

async function strapiGet(pathname) {
  const response = await fetch(`${STRAPI_URL}${pathname}`, { headers: headers(false) });
  if (!response.ok) throw new Error(`${pathname}: ${response.status} ${await response.text()}`);
  return response.json();
}

async function strapiPost(pathname, data) {
  const response = await fetch(`${STRAPI_URL}${pathname}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ data }),
  });
  if (!response.ok) throw new Error(`${pathname}: ${response.status} ${await response.text()}`);
  return response.json();
}

async function findOne(collection, filterKey, value) {
  const params = new URLSearchParams({
    [`filters[${filterKey}][$eq]`]: String(value),
    "pagination[pageSize]": "1",
  });
  const payload = await strapiGet(`/api/${collection}?${params.toString()}`);
  return payload.data?.[0] || null;
}

async function ensureCategory(category, cache) {
  if (cache.has(category.slug)) return cache.get(category.slug);

  if (dryRun) {
    const fakeId = `dry-${category.slug}`;
    cache.set(category.slug, fakeId);
    return fakeId;
  }

  const existing = await findOne("categorias-noticias", "slug", category.slug);
  if (existing) {
    cache.set(category.slug, existing.id);
    return existing.id;
  }

  const created = await strapiPost("/api/categorias-noticias", category);
  cache.set(category.slug, created.data.id);
  return created.data.id;
}

async function uploadImage(url, title) {
  if (!url || url === PLACEHOLDER_IMAGE || skipImages || dryRun) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const fileName = `${slugify(title)}${ext}`;
    const file = new File([arrayBuffer], fileName, { type: response.headers.get("content-type") || "image/jpeg" });
    const form = new FormData();
    form.append("files", file);

    const upload = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: headers(false),
      body: form,
    });

    if (!upload.ok) return null;
    const files = await upload.json();
    return files?.[0]?.id || null;
  } catch (error) {
    console.warn(`No se pudo importar imagen ${url}: ${error.message}`);
    return null;
  }
}

async function importPost(post, categoryCache) {
  if (dryRun) {
    for (const category of post.categorias) {
      await ensureCategory(category, categoryCache);
    }
    return { status: "created", slug: post.slug };
  }

  const duplicateByWpId = post.wp_id_original ? await findOne("noticias", "wp_id_original", post.wp_id_original) : null;
  const duplicateBySlug = await findOne("noticias", "slug", post.slug);
  if (duplicateByWpId || duplicateBySlug) {
    return { status: "skipped", slug: post.slug };
  }

  const categoryIds = [];
  for (const category of post.categorias) {
    categoryIds.push(await ensureCategory(category, categoryCache));
  }

  const imageId = await uploadImage(post.imageUrl, post.titulo);
  const data = {
    titulo: post.titulo,
    slug: post.slug,
    fecha_publicacion: post.fecha_publicacion,
    autor: post.autor,
    contenido: post.contenido,
    resumen: post.resumen,
    categorias: categoryIds,
    wp_id_original: post.wp_id_original,
    wp_url_original: post.wp_url_original,
    wp_imagen_original: post.wp_imagen_original,
    servicio: "Institucional",
  };

  if (imageId) data.imagen_destacada = imageId;

  if (!dryRun) {
    await strapiPost("/api/noticias?status=published", data);
  }

  return { status: "created", slug: post.slug };
}

async function main() {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const posts = parsePosts(xml);
  const categoryCache = new Map();
  const stats = { total: posts.length, created: 0, skipped: 0, failed: 0 };

  console.log(`XML: ${xmlPath}`);
  console.log(`Entradas publicadas tipo post detectadas: ${posts.length}`);
  if (dryRun) console.log("Modo dry-run: no se escribira en Strapi.");

  for (const post of posts) {
    try {
      const result = await importPost(post, categoryCache);
      stats[result.status === "created" ? "created" : "skipped"] += 1;
      console.log(`${result.status}: ${post.slug}`);
    } catch (error) {
      stats.failed += 1;
      console.error(`failed: ${post.slug} - ${error.message}`);
    }
  }

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
