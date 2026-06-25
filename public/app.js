async function cargarNoticias() {
  const grid = document.getElementById("noticiasGrid");

  if (!grid) return;

  try {
    const respuesta = await fetch("/api/noticias?sort=publishedAt:desc");
    const resultado = await respuesta.json();

    grid.innerHTML = "";

    if (!resultado.data || resultado.data.length === 0) {
      grid.innerHTML = "<p>No hay noticias publicadas.</p>";
      return;
    }

    resultado.data.forEach((noticia) => {
      const card = document.createElement("article");
      card.className = "news-card";

      const fecha = noticia.publishedAt
        ? new Date(noticia.publishedAt).toLocaleDateString("es-AR")
        : "Sin fecha";

      card.innerHTML = `
        <div class="news-card-content">
          <span class="news-date">${fecha}</span>
          <h3>${noticia.titulo}</h3>
          <p>${noticia.resumen || "Sin resumen disponible."}</p>
          <a href="/noticia.html?id=${noticia.documentId}" class="card-link">
            Leer más
          </a>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    grid.innerHTML = "<p>No se pudieron cargar las noticias.</p>";
    console.error(error);
  }
}

cargarNoticias();
