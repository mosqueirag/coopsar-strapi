# Content-types necesarios para el portal COOPSAR

El frontend consume contenido a traves del proxy backend de Strapi:

```text
/api/frontend/noticias
/api/frontend/categorias-noticias
/api/frontend/servicios
/api/frontend/tramites
/api/frontend/cortes-programados
/api/frontend/medios-de-pago
/api/frontend/alertas-importantes
/api/frontend/preguntas-frecuentes
```

El token de Strapi nunca se expone en el navegador. Configurar estas variables en local y en el hosting:

```env
STRAPI_URL=https://tu-strapi.com
STRAPI_TOKEN=token-de-api-con-lectura
```

Se mantienen `STRAPI_API_URL` y `STRAPI_API_TOKEN` solo por compatibilidad.

## Permisos del token

Crear un API Token con permiso de lectura para estas colecciones:

- `noticias`
- `categorias-noticias`
- `servicios`
- `tramites`
- `cortes-programados`
- `medios-de-pagos`
- `alertas-importantes`
- `preguntas-frecuentes`

## Noticias

Ya existe como `noticia`.

Campos usados:

- `titulo` string, requerido
- `slug` uid, requerido
- `resumen` text
- `contenido` richtext
- `imagen_destacada` media image
- `categorias` relation many-to-many con `categoria-noticia`
- `servicio` enumeration: `Energia`, `Telecomunicaciones`, `Sepelio`, `Institucional`, `ADECOOP`
- `fecha_publicacion` datetime
- `autor` string
- `wp_id_original` integer unico
- `wp_url_original` string
- `wp_imagen_original` string

Orden:

```text
fecha_publicacion desc, publishedAt desc
```

## Categorias de noticias

Collection type creado como `categoria-noticia`.

Campos usados:

- `nombre` string, requerido
- `slug` uid, requerido
- `descripcion` text
- `wp_slug_original` string
- `noticias` relation many-to-many con `noticia`

Orden:

```text
nombre asc
```

## Importar noticias desde WordPress

El importador esta en:

```text
scripts/import-wordpress.js
```

Ruta por defecto del XML:

```text
data/wordpress/export.xml
```

Tambien se puede indicar una ruta directa:

```powershell
$env:STRAPI_URL="https://tu-strapi.com"
$env:STRAPI_TOKEN="token-de-api-con-permisos"
node scripts/import-wordpress.js --xml="C:\Users\Pc\Desktop\export.xml"
```

Para probar sin escribir en Strapi:

```powershell
node scripts/import-wordpress.js --xml="C:\Users\Pc\Desktop\export.xml" --dry-run --skip-images
```

El script importa solo entradas publicadas de tipo `post`, crea categorias, respeta multiples categorias por noticia, evita duplicados por `wp_id_original` o `slug`, detecta imagen destacada por `_thumbnail_id`, usa la primera imagen del contenido si no existe destacada y cae a `/assets/images/noticia-placeholder.jpg` si no hay imagen. El contenido se limpia quitando shortcodes, scripts y markup no soportado, conservando parrafos, titulos, listas, enlaces e imagenes.

## Servicios

Collection type sugerido:

- singular: `servicio`
- plural: `servicios`

Campos:

- `titulo` string, requerido
- `slug` uid
- `resumen` text
- `descripcion` richtext o text
- `imagen` media image
- `orden` integer

Orden:

```text
orden asc, titulo asc
```

## Tramites

Collection type sugerido:

- singular: `tramite`
- plural: `tramites`

Campos:

- `titulo` string, requerido
- `slug` uid
- `categoria` string o enumeration
- `resumen` text
- `descripcion` richtext o text
- `requisitos` richtext o text
- `orden` integer

Orden:

```text
orden asc, titulo asc
```

## Cortes programados

Collection type sugerido:

- singular: `corte-programado`
- plural: `cortes-programados`

Campos:

- `titulo` string
- `zona` string
- `descripcion` text
- `fecha` datetime
- `estado` enumeration: `Programado`, `En curso`, `Finalizado`

Orden:

```text
fecha asc
```

## Medios de pago

Collection type sugerido:

- singular: `medios-de-pago`
- plural: `medios-de-pagos`

Campos:

- `titulo` string, requerido
- `tipo` string o enumeration
- `resumen` text
- `descripcion` text
- `enlace` string
- `orden` integer

Orden:

```text
orden asc, titulo asc
```

## Alertas importantes

Collection type sugerido:

- singular: `alerta-importante`
- plural: `alertas-importantes`

Campos:

- `titulo` string, requerido
- `tipo` string o enumeration
- `resumen` text
- `descripcion` text
- `enlace` string
- `prioridad` integer

Orden:

```text
prioridad desc, publishedAt desc
```

## Preguntas frecuentes

Collection type sugerido:

- singular: `pregunta-frecuente`
- plural: `preguntas-frecuentes`

Campos:

- `pregunta` string, requerido
- `respuesta` text, requerido
- `categoria` string o enumeration
- `orden` integer

Orden:

```text
orden asc, pregunta asc
```

## Estados del frontend

Cada modulo del frontend contempla:

- loader mientras espera respuesta
- mensaje de error si falla el proxy o Strapi
- estado vacio si la coleccion no tiene contenido
- fallback institucional minimo para que la pagina no quede rota

Los helpers principales estan en:

```text
public/assets/js/main.js
public/js/api.js
```
