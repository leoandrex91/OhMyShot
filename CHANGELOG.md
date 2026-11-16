# Registro de Cambios (Changelog) - Oh My Shot!

Todos los cambios notables y versiones de este proyecto están documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.8.2] - 2026-11-16

### Añadido
- **Creador de Cartas (Card Creator) - Soporte Completo de las 11 Categorías**:
  - Integración de todas las 11 categorías oficiales del juego en el Creador de Cartas (`clásico`, `cultura chupística`, `yo nunca`, `quien es más probable`, `verdad`, `reto`, `retos especiales`, `duelo`, `hot`, `eventos especiales`, `bonus`), permitiendo crear y personalizar cartas para cualquier estilo o dinámica de previa.
  - Soporte específico y tema visual para **Cultura Chupística** (`🍹`, gradiente azul-cian festivo con glow `--card-accent`) y **Retos Especiales** (`🌟`, gradiente magenta-carmesí).
  - Normalización inteligente de cartas de Cultura Chupística: vinculación automática de campos `tema` y `texto`, y configuración de participantes en `grupo`.
  - Integración directa en el adaptador de **Cultura Chupística** (`src/modes/cultura-chupistica/adapter.js`):
    - Inyección prioritaria de las cartas personalizadas creadas en el mazo de partida.
    - Switch independiente para activar/desactivar cartas personalizadas en la configuración del modo (`#mode-settings-custom-cards-check`).
    - Renderizado con distintivo visual `⭐ CUSTOM` en la cabecera de la carta activa durante la partida.
- **Verificación Integral E2E de Flujo de Cartas Personalizadas**:
  - Pruebas automatizadas en Edge CDP cubriendo el ciclo de vida completo: creación, visualización en colección con tags y niveles, filtros por categoría, búsqueda reactiva, edición en modal, exportación/importación en formato JSON y ejecución real en partida de Cultura Chupística con 0 errores de consola.

---

## [0.8.1] - 2026-11-16

### Añadido
- **Nuevo Modo Oficial "Modo Hot +18"**:
  - Incorporación como modo de juego independiente seleccionable en el menú principal (`src/modes/hot/`).
  - Mazo dedicado 100% a cartas picantes (500 cartas por idioma, 1.500 en total) con preguntas íntimas individuales (`[player]`), verdades y retos en pareja (`[player] y [player_x]`).
  - Música ambiental sensual continua (`music_hot_bg.m4a`), efectos visuales de fuego neón, control de intensidad (niveles 1 al 10) y soporte para gestos de deslizamiento (*swipe*).
  - Bloqueo y verificación preventiva de mayoría de edad (+18) antes de iniciar partida.
- **Consolidación de Arquitectura a 3 Idiomas Canónicos**:
  - Simplificación radical del sistema de idiomas eliminando variantes regionales fragmentadas (`es-CO`, `es-ES`, `es-MX`, `en-US`, `en-GB`, `pt-BR`, `pt-PT`) en favor de 3 idiomas universales puros: **Español (`es`)**, **Inglés (`en`)** y **Portugués (`pt`)**.
  - Catálogo consolidado de **19.134 cartas activas**, con exactamente 6.378 cartas por idioma a través de 11 categorías (`clasico`, `duelo`, `yo-nunca`, `quien-es-mas-probable`, `verdad`, `reto`, `retos-especiales`, `eventos-especiales`, `hot`, `bonus`, `cultura-chupistica`).
  - Menú de selección y cambio en tiempo real de idioma en ajustes con banderas oficiales (🇪🇸 Español, 🇺🇸 English, 🇧🇷 Português).
- **Estandarización de Identificadores de Cartas (Card IDs)**:
  - Nueva nomenclatura con prefijo único por categoría y contadores secuenciales reiniciados desde 1 para cada mazo:
    - Clásico: `cla_1` ... `cla_N`
    - Duelo: `due_1` ... `due_N`
    - Yo Nunca: `yon_1` ... `yon_N`
    - Quién es Más Probable: `qmp_1` ... `qmp_N`
    - Verdad: `ver_1` ... `ver_N`
    - Reto: `ret_1` ... `ret_N`
    - Retos Especiales: `res_1` ... `res_N`
    - Eventos Especiales: `eve_1` ... `eve_N`
    - Hot: `hot_1` ... `hot_N`
    - Bonus: `bon_1` ... `bon_N`
    - Cultura Chupística: `chup_1` ... `chup_N`
  - Adaptación total del motor de juego y de todos los adaptadores (`previa-mix`, `verdad-o-reto`, `yo-nunca`, `quien`, `cultura-chupistica`) para procesar los nuevos IDs de manera consistente.
- **Loaders Asíncronos Reales en Pantalla & Precarga Proactiva**:
  - Implementación de loaders visuales reales (`#showScreenLoader` / `#hideScreenLoader`) con anillo de neón giratorio, logotipo pulsante y mensajes contextuales ("Barajando cartas y preparando mesa...").
  - Al pulsar *"Comenzar partida"*, la interfaz muestra de inmediato el loader visual mientras espera de forma asíncrona real (`await`) la compilación del mazo, eliminando por completo la congelación percibida en celulares antes de la cuenta 3, 2, 1, GO.
  - Precarga de cartas en segundo plano durante la pantalla de bienvenida y en el selector de modo de juego para una transición instantánea.

### Corregido
- **Modo Cultura Chupística - Pulido Integral de UX y Renderizado**:
  - Se corrigió el problema visual donde las cartas intermedias no renderizaban el contenido temático.
  - Se retiró el botón estático de pasar en favor del gesto universal de deslizamiento (*swipe*) a cualquier dirección para mantener la consistencia con los demás modos.
  - Al deslizar la carta, se abre de inmediato el selector de jugador para registrar quién falló, incluyendo un botón destacado **"Ninguno"** para avanzar de carta limpiamente sin asignar fallos.
  - Se ampliaron las opciones de temporizador de turno: **Tiempo Libre / Infinito** (por defecto), **5 seg**, **10 seg**, **15 seg** y **Personalizado (1 a 60 seg)**.
  - Se corrigieron los desbordamientos visuales de botones y campos en el menú de configuración de Cultura Chupística.
- **Resolución de Error 404 de Carga Inicial**:
  - Eliminada la importación residual de `editor.storage.js` en `src/modes/previa-mix/adapter.js` que impedía el arranque en navegadores.

### Limpieza y Optimización
- **Eliminación Masiva de Archivos Huérfanos y Código Obsoleto**:
  - Eliminación de 121 archivos huérfanos y más de 408.000 líneas de código en desuso:
    - 7 carpetas de dialectos regionales en `src/cards/`.
    - 28 archivos puente y catálogos obsoletos (`bonus.*.js`, `cards.*.js`, etc.).
    - 14 archivos no utilizados en `src/modes/previa-mix/locales/`.
    - Carpeta y controladores del prototipo de editor (`src/modes/editor/`).
    - Archivos del motor en desuso (`src/engine/`).
  - Actualización del Service Worker (`sw.js`) a la versión `oh-my-shot-v0.8.1` con catálogo limpio de assets locales.

---

## [0.8.0] - 2026-11-15

### Añadido
- **Nuevo Modo Oficial "Cultura Chupística"**:
  - Implementación completa del modo de juego tradicional de rondas por categorías para fiestas y previas.
  - Generación de **2.128 cartas temáticas curadas** distribuidas en 10 niveles de intensidad por idioma (`es`, `en`, `pt`).
  - **Cero ejemplos en cartas**: Los temas se presentan 100% limpios sin revelar respuestas spoiler.
  - **Cantos rituales adaptados por idioma**:
    - Español (`es`): *"Cultura Chupística de [Categoría], como por ejemplo:"*
    - Inglés (`en`): *"Categories of [Category], such as:"*
    - Portugués (`pt`): *"Cultura Chupística de [Categoria], como por exemplo:"*
  - **Temporizador de turnos flexible**:
    - Opción de tiempo libre / infinito (por defecto) o intervalos configurables con cuenta atrás y alerta sonora.
  - **Sistema de seguimiento de fallos y puntos**:
    - Deslizamiento táctil multidireccional idéntico a todos los modos para pasar de carta o registrar fallos.
    - Asignación de castigos dinámicos respetando la preferencia del jugador (con o sin alcohol).
    - **Podio y Marcador Final**: Pantalla de fin de partida que corona a la *"🏆 Mente Rápida"* (menos fallos) y al *"🍻 Rey del Shot"* (más fallos), con tabla de posiciones completa.
  - Selector de rondas objetivo (10 a 100 temas) y configuración en el modal de ajustes de modo.
  - Soporte completo en Service Worker y funcionamiento 100% offline.

---

## [0.7.01] - 2026-11-15

### Añadido
- **Sistema centralizado de castigos localizados**: Nuevo módulo `src/cards/castigos.catalog.js` con catálogos de castigos (bebedores y no bebedores) traducidos y adaptados culturalmente para las 7 variantes regionales (`es-CO`, `es-MX`, `es-ES`, `en-US`, `en-GB`, `pt-BR`, `pt-PT`).
- **Prefijos y formatos de castigos dinámicos según idioma**:
  - Español: `"Castigo: Toma X tragos"` / `"Castigo: Cumple el castigo"`
  - Inglés: `"Penalty: Take X sips"` / `"Forfeit: Do the penalty"`
  - Portugués: `"Penitência: Tome X goles"` / `"Penitência: Cumpra a penitência"`

### Corregido
- **Duplicación de verbos en portugués**: Corrección en las 18 plantillas de catálogos donde aparecía `"Se errar toma [castigo_toma]"` generando frases redundantes como `"toma tome"`. Ahora genera `"Se errar [castigo_toma]"`.
- **Localización de encabezados en cartas de Verdad o Reto**: Las etiquetas de tipo de carta ahora muestran dinámicamente `"Truth"` / `"Dare"` en inglés, `"Verdade"` / `"Desafio"` en portugués y `"Verdad"` / `"Reto"` en español.
- **Manejo defensivo en adaptador de Verdad o Reto**: Validación opcional `session.config?.targetTurns` para prevenir excepciones por valores indefinidos en sesiones directas.

### Cambiado
- **Descripción del modo Verdad o Reto**: Modificada a *"Un clásico: elige confesar tus mayores secretos o cumplir retos épicos."*.
- **Actualización de Service Worker y tokens**: Cache bump a `oh-my-shot-v0.7.01` garantizando recarga inmediata en dispositivos PWA.

---

## [0.7.0] - 2026-11-15

### Añadido
- **Traducción e internacionalización completa del catálogo de cartas**:
  - Traducción al 100% de 4.378 cartas únicas a lo largo de 9 categorías (`clasico`, `retos`, `yo_nunca`, `duelo`, `quien_es_mas`, `bomba`, `ruleta`, `verdad_o_reto`, `hot`).
  - Cobertura completa sin textos residuales en español para `en-US`, `en-GB`, `pt-BR` y `pt-PT`.
  - Eliminación de signos de interrogación invertidos (`¿`) y signos de exclamación invertidos (`¡`) en textos en inglés y portugués.

### Corregido
- **Sombras de iconos en deslizamiento (Swipe Feedback)**:
  - Optimización de las sombras flotantes de los indicadores `GOD` (verde neón) y `BAD` (rojo/magenta) al deslizar cartas a izquierda o derecha, garantizando contraste nítido y efecto resplandor (glow) sobre cualquier fondo.
- **Auditoría de diseño y compatibilidad**:
  - Verificación responsive completa para pantallas pequeñas (360px - 414px), medianas y tablets.
  - Corrección de desbordamientos visuales en barras de navegación y modales flotantes.

### Limpieza
- Eliminación de archivos temporales de traducción, scripts de scrape huérfanos y código redundante.

---

## [0.6.2] - 2026-11-15

### Corregido
- **Música de fondo en cartas HOT**: Se corrigió la reproducción de audio para que las cartas de categoría caliente/picante activen de inmediato la pista musical ambiental especial `music_hot_bg.m4a`, volviendo a la música normal de partida tras pasar la carta.

---

## [0.6.1] - 2026-11-15

### Cambiado
- **Actualización de versión en Service Worker**: Bump a `oh-my-shot-v0.6.1` para forzar la actualización de caché en navegadores móviles y aplicaciones instaladas como PWA.

---

## [0.6.0] - 2026-11-15

### Añadido
- **Música dinámica en juego (`music_bg_play.m4a`)**:
  - Transición automática de audio sincronizada con la cuenta regresiva "3, 2, 1, ¡GO!".
  - Retorno suave a la pista principal `music_bg.m4a` al finalizar la partida o regresar al lobby de inicio.
- **Animación de entrada de cartas (Slide-in)**:
  - Efecto de deslizamiento fluido desde el lateral izquierdo hacia el centro con aceleración natural en todos los modos de juego.
- **Licencia Pública No Comercial**:
  - Adopción de la licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0), permitiendo libre uso, modificación y distribución comunitaria, prohibiendo la venta o explotación comercial cerrada.

### Cambiado
- **Limpieza visual en Verdad o Reto**: Se eliminaron insignias invasivas ("Modo Tranqui", "Racha Reto") de la parte superior de las cartas para una experiencia limpia y centrada en el contenido.
- **Actualización de enlaces de repositorio**: Enlace principal actualizado a `https://github.com/leoandrex91/OhMyShot`.

---

## [0.5.0] - 2026-11-15

### Añadido
- **Nuevo Modo de Juego: Verdad o Reto (Truth or Dare)**:
  - Sistema de turnos por jugador con selector de Verdad o Reto.
  - Mecánica de control de racha: límite configurable de 3 verdades consecutivas por jugador antes de forzar un reto obligatorio.
  - Rondas sorpresa de "Bonus Directo" asignadas aleatoriamente entre los jugadores de la ronda.
  - Animación de giro de carta 3D (flip) al descubrir la pregunta o penitencia.
  - Selector de intensidad y filtros específicos de categoría HOT para Verdad o Reto.

---

## [0.4.0] - 2026-11-14

### Añadido
- **Arquitectura modular por adaptadores**:
  - Desacoplamiento de la lógica de juego en `src/modes/previa-mix`, `src/modes/verdad-o-reto` y `src/modes/editor`.
- **Creador y Editor de Cartas Offline**:
  - Herramienta completa integrada en el juego para crear, editar, filtrar y organizar paquetes de cartas.
  - Exportación e importación local de mazos en formatos JSON y código JavaScript.
- **Soporte PWA (Progressive Web App)**:
  - Service Worker con estrategia de caché offline completa (`sw.js`).
  - Almacenamiento local seguro en IndexedDB y LocalStorage sin requerir conexión a internet.

---

## [0.3.0] - 2026-11-12

### Añadido
- **Soporte multilingüe e internacionalización (i18n)**:
  - Integración de 7 variantes regionales: Español (Colombia, México, España), Inglés (Estados Unidos, Reino Unido) y Portugués (Brasil, Portugal).
  - Selector de idioma en tiempo real con persistencia en configuración.
- **Selector de Avatares**:
  - Catálogo de 32 avatares de fiesta renderizados mediante spritesheets SVG de alto rendimiento.
- **Sistema de Audio y SFX**:
  - Efectos de sonido para toques, aciertos, fallos, cuenta regresiva y transiciones de pantalla.

---

## [0.2.0] - 2026-11-11

### Añadido
- **Categorías dinámicas de juego**:
  - Clásico, Duelo, Yo Nunca, Quién es más probable, Retos, Bomba de tiempo y Eventos grupales.
- **Filtro de Modo HOT (+18)**:
  - Diálogo de advertencia y confirmación explícita de consentimiento para contenido picante/adulto.
- **Selector de Intensidad**:
  - 4 niveles de fiesta ajustables: Tranqui, Normal, Fiesta Épica y Descontrol.

---

## [0.1.0] - 2026-11-11

### Añadido
- **Prototipo inicial de Oh My Shot!**:
  - Party Game web offline diseñado para jugarse desde un único teléfono compartido en grupo.
  - Registro ágil de jugadores con perfiles de bebedor y no bebedor (sustitutos de castigo sin alcohol).
  - Interfaz visual con diseño Glassmorphism y estética Cyberpunk / Party Night.
