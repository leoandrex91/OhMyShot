# Registro de Cambios (Changelog) - Oh My Shot!

Todos los cambios notables y versiones de este proyecto están documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.8.0] - 2026-11-15

### Añadido
- **Nuevo Modo Oficial "Cultura Chupística"**:
  - Implementación completa del modo de juego tradicional de rondas por categorías para fiestas y previas.
  - Generación de **14.000 cartas temáticas únicas** (exactamente 2.000 cartas distribuidas en 10 niveles de intensidad por país/idioma en `es-CO`, `es-MX`, `es-ES`, `en-US`, `en-GB`, `pt-BR` y `pt-PT`).
  - **Cero ejemplos en cartas**: Los temas se presentan 100% limpios sin revelar respuestas spoiler.
  - **Cantos rituales localizados dinámicamente**:
    - Colombia y Latinoamérica (`es-CO`): *"Cultura Chupística de [Categoría], como por ejemplo:"*
    - México (`es-MX`): *"Caricachupas presenta: [Categoría], como por ejemplo:"*
    - España (`es-ES`): *"Cultura Chupística de [Categoría], como por ejemplo:"*
    - Estados Unidos y Reino Unido (`en-US`, `en-GB`): *"Categories of [Category], such as:"*
    - Brasil y Portugal (`pt-BR`, `pt-PT`): *"Cultura Chupística / Cultura do Gole de [Categoria], como por exemplo:"*
  - **Temporizador configurable**:
    - Opción de tiempo infinito / libre (por defecto) para mantener el compás natural con palmadas entre amigos.
    - Opciones de temporizador de turno con cuenta atrás de 4s (Descontrol), 6s (Normal) y 8s (Tranqui).
  - **Sistema de seguimiento de fallos y puntos**:
    - Botón táctil gigante *"¡Pasa! 👉"* para avanzar el turno por el círculo de jugadores.
    - Botón táctil *"💥 ¡Alguien Falló!"* que despliega un modal selector de jugador para registrar quién repitió, dudó o se equivocó.
    - Asignación de castigos dinámicos respetando la preferencia del jugador (con o sin alcohol).
    - **Podio y Marcador Final**: Pantalla de fin de partida que corona a la *"🏆 Mente Rápida"* (menos fallos) y al *"🍻 El Más Prendido / Rey del Shot"* (más fallos), con tabla de posiciones completa.
  - Selector de rondas objetivo (10 a 100 temas) y configuración en el modal de ajustes de modo.
  - Soporte completo en Service Worker (`v0.8.0`) y precarga offline de todos los catálogos.

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
