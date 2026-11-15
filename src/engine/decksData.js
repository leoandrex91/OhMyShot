/**
 * Banco de cartas Fase 1 (Data-Driven, bilingue ES/EN).
 * Cada carta tiene categorias, intensidad (1..5), minPlayers y plantillas {current}/{other}/{penalty}.
 */
export const PHASE1_DECK = [
  // --- DRINK / TRAGO ---
  {
    id: 'drk-01',
    category: 'drink',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current} reparte {penalty} entre quienes tengan el móvil con menos del 50% de batería.',
    templateEn: '{current} hands out {penalty} to anyone whose phone battery is under 50%.'
  },
  {
    id: 'drk-02',
    category: 'drink',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 0,
    templateEs: 'Todos los que lleven puesta alguna prenda negra cumplen {penalty}.',
    templateEn: 'Everyone wearing something black takes {penalty}.'
  },
  {
    id: 'drk-03',
    category: 'drink',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, elige a tu gemelo de castigo: cada vez que cumplas {penalty} los próximos 2 turnos, {other} también cumple.',
    templateEn: '{current}, pick a penalty twin: whenever you take a penalty, {other} matches it!'
  },
  {
    id: 'drk-04',
    category: 'drink',
    intensity: 2,
    minPlayers: 3,
    penaltyUnits: 1,
    durationTurns: 0,
    templateEs: '¡Brindis rápido! El último en levantar su vaso o mano al aire cumple {penalty}.',
    templateEn: 'Quick toast! Last person to raise their glass or hand takes {penalty}.'
  },
  {
    id: 'drk-05',
    category: 'drink',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'Los jugadores a la izquierda y derecha de {current} cumplen {penalty}.',
    templateEn: 'The players sitting immediately left and right of {current} take {penalty}.'
  },
  {
    id: 'drk-06',
    category: 'drink',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, si revisaste el móvil en los últimos 3 minutos antes de este turno, cumples {penalty}.',
    templateEn: '{current}, if you checked social media in the last 3 minutes, take {penalty}.'
  },

  // --- NEVER HAVE I EVER / YO NUNCA ---
  {
    id: 'nh-01',
    category: 'never_have',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 0,
    templateEs: 'Yo nunca he stalkeado a alguien por error y le he dado "me gusta" a una foto vieja. Si lo hiciste, {penalty}.',
    templateEn: 'Never have I ever accidentally liked an old photo while stalking someone. Guilty ones take {penalty}.'
  },
  {
    id: 'nh-02',
    category: 'never_have',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 0,
    templateEs: 'Yo nunca he dicho "ya voy saliendo" cuando todavía estaba en la cama. Quien lo haya hecho cumple {penalty}.',
    templateEn: 'Never have I ever texted "on my way" while still in bed. Take {penalty} if guilty.'
  },
  {
    id: 'nh-03',
    category: 'never_have',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'Yo nunca he fingido una llamada para escapar de una conversación incómoda. Culpables: {penalty}.',
    templateEn: 'Never have I ever faked a phone call to escape an awkward chat. Guilty: {penalty}.'
  },
  {
    id: 'nh-04',
    category: 'never_have',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'Yo nunca me he quedado dormido en medio de una fiesta o en un transporte y me pasé de parada. Quien sí, {penalty}.',
    templateEn: 'Never have I ever fallen asleep at a party or missed my transit stop. Take {penalty} if you have.'
  },
  {
    id: 'nh-05',
    category: 'never_have',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'Yo nunca he enviado un mensaje comprometedor a la persona equivocada (o al grupo equivocado). Cumplen {penalty}.',
    templateEn: 'Never have I ever sent a risky text to the wrong person or group chat. Guilty: {penalty}.'
  },
  {
    id: 'nh-06',
    category: 'never_have',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'Yo nunca he vuelto a hablar con un ex después de jurar que jamás lo haría. Quien haya caído: {penalty}.',
    templateEn: 'Never have I ever texted an ex after swearing I never would again. Guilty: {penalty}.'
  },
  {
    id: 'nh-07',
    category: 'never_have',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: 'Yo nunca me he escapado sin pagar o he entrado colado a un evento/fiesta. Quienes lo hayan hecho: {penalty}.',
    templateEn: 'Never have I ever snuck into a party or event without paying. Take {penalty} if guilty.'
  },
  {
    id: 'nh-08',
    category: 'never_have',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: 'Yo nunca he besado a alguien de esta sala o he tenido un crush secreto con alguien presente. Si sí: {penalty}.',
    templateEn: 'Never have I ever kissed someone in this room or crushed on someone here. Take {penalty} if guilty.'
  },

  // --- TRUTH / VERDAD ---
  {
    id: 'tr-01',
    category: 'truth',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, ¿cuál fue la excusa más ridícula que inventaste para cancelar un plan? Si no convences a {other}, {penalty}.',
    templateEn: '{current}, what is the dumbest excuse you made to cancel plans? If {other} is not convinced, {penalty}.'
  },
  {
    id: 'tr-02',
    category: 'truth',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, enseña las últimas 3 búsquedas en tu historial o redes sociales... o cumple {penalty}.',
    templateEn: '{current}, show your last 3 search history entries on your phone... or take {penalty}.'
  },
  {
    id: 'tr-03',
    category: 'truth',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, ¿quién de la mesa crees que sobreviviría menos tiempo en un apocalipsis zombie y por qué?',
    templateEn: '{current}, who at this table would survive the shortest in a zombie apocalypse and why?'
  },
  {
    id: 'tr-04',
    category: 'truth',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, confiesa qué es lo más vergonzoso que hiciste en una cita y nadie aquí sabía (o cumple {penalty}).',
    templateEn: '{current}, confess the most embarrassing thing you did on a date that nobody here knows (or take {penalty}).'
  },
  {
    id: 'tr-05',
    category: 'truth',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, si tuvieras que borrar a alguien de tu WhatsApp ahora mismo, ¿qué criterio usarías sin mentir?',
    templateEn: '{current}, what is the biggest red flag someone in this room ignores on dates? Answer honestly or take {penalty}.'
  },
  {
    id: 'tr-06',
    category: 'truth',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, ¿cuál fue el mensaje más arriesgado que enviaste esta semana? Léelo en voz alta o cumple {penalty}.',
    templateEn: '{current}, read aloud the riskiest text you sent this week or take {penalty}.'
  },

  // --- DARE / RETO ---
  {
    id: 'da-01',
    category: 'dare',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, imita la risa o forma de caminar de {other} durante 10 segundos. Si el grupo no se ríe, {penalty}.',
    templateEn: '{current}, impersonate how {other} laughs or walks for 10 seconds. If nobody laughs, {penalty}.'
  },
  {
    id: 'da-02',
    category: 'dare',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current} debe hablar en tercera persona hasta que vuelva a tocarle turno. Cada desliz cuesta {penalty}.',
    templateEn: '{current} must speak in third person until their next turn. Every slip costs {penalty}.'
  },
  {
    id: 'da-03',
    category: 'dare',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, deja que {other} elija una canción para que cantes el coro a capella durante 10 segundos (o {penalty}).',
    templateEn: '{current}, let {other} pick a song for you to sing the chorus acapella for 10 seconds (or {penalty}).'
  },
  {
    id: 'da-04',
    category: 'dare',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, manda un sticker o emoji random al último chat que abriste (sin explicar nada por 5 minutos) o {penalty}.',
    templateEn: '{current}, send a random emoji with zero context to your most recent chat (or take {penalty}).'
  },
  {
    id: 'da-05',
    category: 'dare',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, haz 12 sentadillas o una plancha de 20 segundos mientras cuentas en voz alta. Si te rindes: {penalty}.',
    templateEn: '{current}, do 12 squats or hold a 20-second plank while counting out loud. Give up = {penalty}.'
  },
  {
    id: 'da-06',
    category: 'dare',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, dale tu teléfono desbloqueado a {other} por 15 segundos para que mire tu galería de memes recientes (o {penalty}).',
    templateEn: '{current}, hand your unlocked phone to {other} for 15 seconds to view your latest memes/photos (or {penalty}).'
  },

  // --- MOST LIKELY TO / MAS PROBABLE ---
  {
    id: 'ml-01',
    category: 'most_likely',
    intensity: 1,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'A la de 3, señalen quién es más probable que pierda las llaves o el móvil hoy. El ganador cumple {penalty}.',
    templateEn: 'On 3, point to who is most likely to lose their keys or phone tonight. Winner takes {penalty}.'
  },
  {
    id: 'ml-02',
    category: 'most_likely',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '¿Quién es más probable que termine pidiendo comida rápida a las 4 a. m. para todos? Voten y el elegido cumple {penalty}.',
    templateEn: 'Who is most likely to order 4 AM fast food for everyone? Vote and the winner takes {penalty}.'
  },
  {
    id: 'ml-03',
    category: 'most_likely',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '¿Quién es más probable que se haga amigo de un desconocido en el baño del bar? El más votado: {penalty}.',
    templateEn: 'Who is most likely to become best friends with a stranger in line? Most voted takes {penalty}.'
  },
  {
    id: 'ml-04',
    category: 'most_likely',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '¿Quién es más probable que diga "solo una copa tranquila" y sea el último en irse? Cumple {penalty}.',
    templateEn: 'Who is most likely to say "just one chill drink" and close down the night? Winner takes {penalty}.'
  },
  {
    id: 'ml-05',
    category: 'most_likely',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '¿Quién es más probable que escriba a un ex si la fiesta se alarga? Señalen ya — culpable cumple {penalty}.',
    templateEn: 'Who is most likely to text an ex if tonight keeps going? Point on 3 — winner takes {penalty}.'
  },
  {
    id: 'ml-06',
    category: 'most_likely',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '¿Quién es más probable que acabe en una anécdota legendaria (o vetado de un karaoke)? Cumple {penalty}.',
    templateEn: 'Who is most likely to become a local karaoke legend (or get kicked out)? Winner takes {penalty}.'
  },

  // --- EVENT / EVENTOS GLOBALES ---
  {
    id: 'ev-01',
    category: 'event',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 3,
    ruleTitleEs: 'Prohibido decir "Sí" o "No"',
    ruleTitleEn: 'No saying "Yes" or "No"',
    templateEs: 'EVENTO GLOBAL: Nadie puede decir "Sí" ni "No" durante 3 turnos. Quien caiga cumple {penalty}.',
    templateEn: 'GLOBAL EVENT: Nobody can say "Yes" or "No" for 3 turns. Anyone who slips takes {penalty}.'
  },
  {
    id: 'ev-02',
    category: 'event',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 3,
    ruleTitleEs: 'Mano izquierda obligatoria',
    ruleTitleEn: 'Left hand only',
    templateEs: 'EVENTO GLOBAL: Todos deben sostener su bebida o el móvil solo con la mano izquierda durante 3 turnos. Quien falle: {penalty}.',
    templateEn: 'GLOBAL EVENT: Everyone must hold drinks/phones with their left hand only for 3 turns. Slip = {penalty}.'
  },
  {
    id: 'ev-03',
    category: 'event',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 1,
    durationTurns: 4,
    ruleTitleEs: 'Prohibido señalar con el dedo',
    ruleTitleEn: 'No finger pointing',
    templateEs: 'EVENTO GLOBAL: Prohibido señalar con el dedo (solo con el codo o la barbilla) durante 4 turnos. Quien señale: {penalty}.',
    templateEn: 'GLOBAL EVENT: No pointing with fingers for 4 turns (chin or elbow only!). Slip = {penalty}.'
  },

  // --- VERSUS / DUELOS ---
  {
    id: 'vs-01',
    category: 'versus',
    intensity: 2,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'DUELO: {current} vs {other}. Mirada fija sin reír ni parpadear. El primero en ceder cumple {penalty}.',
    templateEn: 'DUEL: {current} vs {other}. Staring contest without laughing or blinking. First to crack takes {penalty}.'
  },
  {
    id: 'vs-02',
    category: 'versus',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: 'CASCADA EXPRESS: {current} vs {other} nombran países de América o Europa por turnos sin repetir (3 seg máx). Quien trabe: {penalty}.',
    templateEn: 'RAPID DUEL: {current} vs {other} take turns naming countries (3 sec limit). First to hesitate takes {penalty}.'
  },

  // --- HOT / PICANTE ---
  {
    id: 'hot-01',
    category: 'hot',
    intensity: 3,
    minPlayers: 2,
    penaltyUnits: 2,
    durationTurns: 0,
    templateEs: '{current}, confiesa qué es lo primero que te atrae físicamente de {other} o cumple {penalty}.',
    templateEn: '{current}, confess the first physical trait you notice about {other} or take {penalty}.'
  },
  {
    id: 'hot-02',
    category: 'hot',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, del 1 al 10, ¿qué tanto te atrae alguien presente en esta sala? Di el número sin dar el nombre (o {penalty}).',
    templateEn: '{current}, rate 1-10 how attractive you find someone in this room without naming them (or take {penalty}).'
  },
  {
    id: 'hot-03',
    category: 'hot',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, elige a quién de la sala besarías en una escena de película y con quién jamás repetirías cita (o {penalty}).',
    templateEn: '{current}, pick who in the room you would kiss in a movie scene and who would be pure chaos to date (or {penalty}).'
  },
  {
    id: 'hot-04',
    category: 'hot',
    intensity: 4,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: '{current}, susúrrale al oído a {other} tu peor pensamiento o fantasía de esta semana. Si {other} se sonroja o ríe, ambos cumplen {penalty}.',
    templateEn: '{current}, whisper a wild confession in {other}\'s ear. If {other} laughs or blushes, both take {penalty}.'
  },
  {
    id: 'hot-05',
    category: 'hot',
    intensity: 5,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: 'ROULETTE HOT: {current} responde la pregunta más picante que le haga {other}, o cumple {penalty} sin protestar.',
    templateEn: 'HOT ROULETTE: {current} answers the spiciest question {other} asks, or takes {penalty} immediately.'
  },
  {
    id: 'hot-06',
    category: 'hot',
    intensity: 5,
    minPlayers: 2,
    penaltyUnits: 3,
    durationTurns: 0,
    templateEs: 'CONFIESA O PAGA: ¿Cuál es tu lugar más atrevido o inusual donde has dado un beso apasionado? Si callas: {penalty}.',
    templateEn: 'CONFESS OR PAY: What is the boldest or weirdest place you have kissed someone? Stay quiet = {penalty}.'
  }
];

