export default {
  routes: [
    {
      method: 'GET',
      path: '/frontend/noticias',
      handler: 'frontend.noticias',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/servicios',
      handler: 'frontend.servicios',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/tramites',
      handler: 'frontend.tramites',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/medios-de-pago',
      handler: 'frontend.mediosDePago',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/cortes-programados',
      handler: 'frontend.cortesProgramados',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/alertas-importantes',
      handler: 'frontend.alertasImportantes',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/frontend/preguntas-frecuentes',
      handler: 'frontend.preguntasFrecuentes',
      config: { auth: false },
    },
  ],
};
