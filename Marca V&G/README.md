# V&G Proyectos y Servicios

**V&G Proyectos y Servicios, C.A.** (RIF J-50477953-9) es una empresa venezolana dedicada a la **prestación de servicios y la planificación de proyectos en el sector petrolero**. Este manual define cómo se ve, cómo suena y cómo se aplica la marca en documentos, vehículos, uniformes y canales digitales. Todo parte del sello circular existente: un barril con una gota de crudo, rodeado por la razón social en una serif clásica.

## Esencia de marca

- **Qué hacemos:** planificamos proyectos y prestamos servicios a la industria petrolera en Venezuela, desde la ingeniería de la idea hasta la ejecución en campo.
- **Promesa:** proyectos bien planificados y servicios que se cumplen como se prometieron: en alcance, en plazo y sin incidentes.
- **Personalidad:** sólida, confiable, técnica, sobria. Rigor de oficina de proyectos con experiencia de campo.
- **Concepto visual — "Crudo y acero":** el negro del petróleo crudo como base, el ámbar del crudo a contraluz como acento, el azul petróleo como color institucional y el gris acero de la infraestructura como estructura.

## Voz y tono

- Frases cortas y precisas. Datos antes que adjetivos: alcances, cronogramas, hitos, plazos.
- Tratamiento de **usted** con clientes y operadoras; tono directo y respetuoso.
- Sí: "Planificación y ejecución del proyecto en 90 días." · "Servicio completado según cronograma."
- No: superlativos ("el mejor", "líder absoluto"), signos de exclamación, emojis, anglicismos innecesarios.
- La razón social se escribe **V&G Proyectos y Servicios, C.A.** en documentos legales y **V&G Proyectos y Servicios** en el resto. Abreviatura aceptada en espacios reducidos: **V&G**.

## Logotipo

El logo es un **sello circular**: doble anillo exterior, anillo interior, barril con gota de crudo y la leyenda "V & G PROYECTOS Y SERVICIOS, C.A." con el RIF en la base. Se usa siempre completo, sin recomponer ni redibujar sus partes. Archivos en el grupo de assets **Logos**.

| Versión | Archivo | Cuándo |
|---|---|---|
| Blanco | `vg-logo-blanco.png` | Sobre `marca-negro-crudo`, `marca-azul-petroleo` o fotografía oscura. Versión principal. |
| Negro | `vg-logo-negro.png` | Sobre `marca-hueso`, blanco y papel. Documentos y facturas. |
| Ámbar | `vg-logo-ambar.png` | Solo sobre negro, en piezas especiales (portadas, regalos corporativos, placas). |
| Original | `vg-logo-original.jpg` | Referencia del arte original sobre fondo negro. No usar en producción. |

- **Área de protección:** alrededor del sello, un espacio libre igual a la altura del barril dividida entre 3 (≈ 12% del diámetro). Nada entra ahí.
- **Tamaño mínimo:** 22 mm de diámetro impreso / 96 px en pantalla. Por debajo de eso el RIF deja de leerse; usa entonces el nombre en texto.
- **Fondos:** blanco sobre oscuro, negro sobre claro. Sobre ámbar o naranja usar el logo negro.
- **No hacer:** estirar o achatar el círculo; cambiar la tipografía de la leyenda; separar el barril del anillo; poner el logo en colores fuera de esta tabla; añadir sombras, biseles o degradados; colocarlo sobre fotografías con mucho detalle sin una franja sólida detrás.

## Color

La paleta sale del rubro: **petróleo crudo, acero de infraestructura petrolera, ingeniería y señalización de seguridad**.

| Color | Hex | Token | Rol | Proporción |
|---|---|---|---|---|
| Negro Petróleo Crudo | `#0E0F11` | `marca-negro-crudo` | Base de marca, fondo del logo, vehículos, uniformes | 60% |
| Azul Petróleo | `#1F4E5F` | `marca-azul-petroleo` | Institucional: documentos, tablas, pie de página | 20% |
| Blanco Hueso | `#F4F1EA` | `marca-hueso` | Papel, fondos claros, texto sobre negro | — |
| Ámbar Crudo | `#D4A03A` | `marca-ambar` | Acento: franjas, cifras clave, botón principal | 10% |
| Acero Industrial | `#5B6470` | `marca-acero` | Líneas, iconos, detalles técnicos | 5% |
| Grafito | `#23262B` | `marca-grafito` | Paneles sobre negro | — |
| Niebla | `#C9CDD2` | `marca-niebla` | Bordes en piezas claras | — |
| Naranja Seguridad | `#E8692A` | `marca-naranja-seguridad` | **Solo HSE**: riesgo, reflectivos | <5% |

Equivalencias de impresión aproximadas (verificar con prueba de color del proveedor): Negro Crudo ≈ CMYK 75/65/60/90 (negro enriquecido); Azul Petróleo ≈ Pantone 7476 C; Ámbar Crudo ≈ Pantone 7563 C; Acero ≈ Pantone 431 C; Naranja Seguridad ≈ Pantone 1585 C.

**Reglas de uso**
- Texto sobre ámbar siempre negro (`on-accent`, 8.1:1). Texto sobre azul petróleo siempre hueso (8.0:1).
- En pantallas claras el ámbar como **texto** pasa a `accent-text` (#8C6512) para mantener 4.7:1.
- El naranja de seguridad nunca decora: si aparece, comunica riesgo.
- Los estados de proyectos y servicios (en planificación, en ejecución, completado, suspendido) usan `secondary`, `accent`, `success` y `danger`, siempre acompañados de la palabra.

## Tipografía

- **Cormorant Garamond** (`display`, 600) — títulos, razón social, portadas. Serif clásica que continúa la leyenda del sello y da el tono formal.
- **IBM Plex Sans** (`sans`, 400/600) — todo el texto de lectura, interfaz, tablas y señalética. Diseñada con raíz industrial; muy legible en tamaños pequeños.
- **IBM Plex Mono** (`mono`, 500) — RIF, códigos de proyecto, números de documento, fechas, montos y cantidades. Los números alinean en columnas.

Las tres son gratuitas en Google Fonts. Sustitutos de sistema si no están instaladas: Georgia / Arial / Consolas.

Jerarquía: `display-xl` 56 → `display-l` 40 → `titulo` 28 (serif) · `subtitulo` 20 → `cuerpo` 16 → `cuerpo-s` 14 → `etiqueta` 12 en MAYÚSCULAS con tracking 0.12em (sans) · `dato` 14 (mono). Nunca más de dos familias en una misma línea de texto.

## Elementos gráficos

- **Franja de marca:** banda ámbar delgada sobre banda azul petróleo más ancha. Es la firma horizontal de la marca: aparece en los vehículos, en el pie de la tarjeta, en el filete del membrete y en la parte baja de portadas.
- **Doble anillo:** los dos círculos concéntricos del sello pueden usarse como trazo fino, recortado, en portadas o fondos (nunca con el barril dentro: ese es el logo).
- **Esquinas rectas:** `radius-0` en piezas impresas y rotulado; `radius-md` (4px) como máximo en interfaces.
- **Sin** degradados, brillos metálicos, efectos 3D ni texturas de petróleo derramado.

## Iconografía y fotografía

- Iconos lineales de trazo 1.5–2 px, terminaciones rectas, en `marca-acero` o `ink`. Temas: plano, cronograma, torre/balancín, tubería, gota, llave, casco, ubicación. Librería sugerida: Lucide o Phosphor (estilo regular).
- Fotografía real de la operación: equipos de trabajo planificando y ejecutando en campo, instalaciones petroleras, personal con EPP completo, luz de amanecer o atardecer (tonos ámbar naturales). Tratamiento: contraste alto, saturación ligeramente reducida. Evitar fotos de stock genéricas, derrames, quema de gas o personal sin equipo de protección.

## Uso de este sistema

Los colores son tokens semánticos con tema **Oscuro · Crudo** (por defecto, el de la marca) y **Claro · Documento** (papelería y web clara); los tokens `marca-*` son fijos. Los componentes son clases CSS en `components/bundle.css` con prefijo `vg-` (no requieren React); `window.VG.logos` expone las URLs de las versiones del logo. Aplicaciones detalladas (uniformes, cascos, señalización, redes sociales) en la sección **Aplicaciones**.
