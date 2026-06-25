export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function imageUrl(media) {
  if (!media) return "";

  const image = Array.isArray(media) ? media[0] : media;
  const url = image?.formats?.medium?.url || image?.formats?.small?.url || image?.url;

  if (!url) return "";
  return url.startsWith("http") ? url : url;
}

export function detailUrl(item) {
  if (item.slug) return `/noticia.html?slug=${encodeURIComponent(item.slug)}`;
  return `/noticia.html?id=${encodeURIComponent(item.documentId || item.id || "")}`;
}
