export const navSections = [
  {
    label: "Usuarios",
    href: "#servicios",
    items: [
      { label: "Servicios", href: "#servicios", description: "Energia, telecomunicaciones y sepelio." },
      { label: "Facturas y pagos", href: "#facturas", description: "Consulta y medios de pago." },
      { label: "Tramites", href: "#tramites", description: "Altas, bajas, cambios y solicitudes." },
    ],
  },
  {
    label: "Atencion",
    href: "#reclamos",
    items: [
      { label: "Reclamos tecnicos", href: "#reclamos", description: "Reporta inconvenientes de servicio." },
      { label: "Cortes programados", href: "#cortes", description: "Mantenimientos y avisos operativos." },
      { label: "Contacto", href: "#contacto", description: "Canales, horarios y ubicacion." },
    ],
  },
  {
    label: "Institucional",
    href: "#noticias",
    items: [
      { label: "Noticias", href: "#noticias", description: "Novedades y comunicados." },
      { label: "ADECOOP", href: "#adecoop", description: "Beneficios y comunidad." },
      { label: "Cooperativa", href: "#contacto", description: "Informacion institucional." },
    ],
  },
];

export const quickLinks = [
  { label: "Pagar factura", href: "#facturas", text: "Medios de pago y consultas de deuda." },
  { label: "Informar reclamo", href: "#reclamos", text: "Canal tecnico para servicios esenciales." },
  { label: "Ver cortes", href: "#cortes", text: "Mantenimientos y avisos programados." },
  { label: "Iniciar tramite", href: "#tramites", text: "Solicitudes frecuentes en un solo lugar." },
];

export const fallbackServices = [
  {
    titulo: "Energia",
    resumen: "Informacion sobre suministro electrico, guardias, solicitudes y novedades operativas.",
    slug: "energia",
  },
  {
    titulo: "Telecomunicaciones",
    resumen: "Conectividad, soporte, planes y atencion para usuarios del servicio.",
    slug: "telecomunicaciones",
  },
  {
    titulo: "Sepelio",
    resumen: "Acompanamiento, consultas administrativas y datos de contacto del servicio.",
    slug: "sepelio",
  },
  {
    titulo: "Institucional",
    resumen: "Gestion cooperativa, comunicados, actividades y relacion con la comunidad.",
    slug: "institucional",
  },
];

export const fallbackProcedures = [
  {
    titulo: "Alta o baja de servicio",
    resumen: "Documentacion requerida, tiempos estimados y canales de atencion.",
    categoria: "Servicios",
  },
  {
    titulo: "Cambio de titularidad",
    resumen: "Solicitud para actualizar datos del titular de una cuenta o suministro.",
    categoria: "Administracion",
  },
  {
    titulo: "Consulta de factura",
    resumen: "Orientacion para revisar deuda, vencimientos y comprobantes de pago.",
    categoria: "Facturacion",
  },
];

export const fallbackOutages = [
  {
    titulo: "Sin cortes programados informados",
    zona: "Sarmiento",
    fecha: "",
    descripcion: "Cuando Strapi tenga avisos publicados, apareceran en este bloque.",
  },
];

export const fallbackNews = [
  {
    titulo: "Bienvenido al nuevo sitio institucional",
    slug: "bienvenido-nuevo-sitio",
    resumen: "COOPSAR prepara una experiencia digital mas clara para socios y usuarios.",
    servicio: "Institucional",
    fecha_publicacion: new Date().toISOString(),
  },
];

export const contactItems = [
  { title: "Atencion al usuario", text: "Lunes a viernes, horarios a definir.", action: "Ver canales" },
  { title: "Guardia tecnica", text: "Canal para inconvenientes urgentes de servicio.", action: "Reportar" },
  { title: "Sede administrativa", text: "Sarmiento, Chubut. Datos editables desde el front.", action: "Ubicacion" },
];
