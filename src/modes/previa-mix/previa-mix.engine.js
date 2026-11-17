import { getBonusCardsForLocale } from '../../config/bonusCards.catalog.js';

/**
 * Oh My Shot! — Previa Mix engine v3.0 (ESM, dependency-free, offline).
 * English source code / seven localized catalogs. No scores or leaderboards.
 * All participants are selected randomly per card, with mild fairness weighting.
 * [player] and [player_X] always refer to distinct player IDs.
 * Group events: participation or a non-alcoholic social forfeit; no forced drinking, touching or disclosure.
 */
export const TYPES = Object.freeze([
  'clásico', 'duelo', 'yo nunca', 'quien es más probable',
  'verdad', 'reto', 'retos especiales', 'eventos especiales', 'hot', 'bonus',
  'verdad_hot', 'reto_hot', 'yo_nunca_hot', 'quien_hot', 'cultura_hot'
]);
export const SUPPORTED_LOCALES = Object.freeze([
  'es', 'en', 'pt',
  // Compatibilidad hacia atrás
  'en-US','en-GB','es-CO','es-MX','es-ES','pt-BR','pt-PT',
]);
const ALLOWED_PENALTIES = new Set(['sorbo','medio trago','1 trago']);
const MAX_SESSION_HISTORY = 1500;
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const assert = (value,msg) => { if (!value) throw new Error(`[Previa Mix] ${msg}`); };
const allAdult = (v) => v === true;

function draw(rng) {
  const x=Number(rng());
  assert(Number.isFinite(x) && x >= 0 && x < 1,'random generator must yield [0,1)');
  return x;
}
function weightedPick(items, weight, rng) {
  assert(items.length > 0, 'cannot pick from an empty array');
  const ws=items.map((item)=>Math.max(0,Number(weight(item))||0));
  let r=draw(rng)*ws.reduce((a,b)=>a+b,0);
  if (!ws.some(Boolean)) return items[Math.floor(draw(rng)*items.length)];
  for (let i=0;i<items.length;i++) {r-=ws[i];if(r<0) return items[i];}
  return items[items.length-1];
}

/** All seven catalogs must share identical metadata for the same card ID. */
export function validateCatalog(cards) {
  const issues=[];const ids=new Set();const counts=new Map();
  if (!Array.isArray(cards)) return ['Catalog must be an array'];
  cards.forEach((c,i)=>{
    const ref=`card[${i}]`;
    const idStr = String(c?.id ?? '').trim();
    if (!idStr || ids.has(idStr)) issues.push(`${ref}: invalid/duplicate id`);
    ids.add(idStr);
    if (!Number.isInteger(c?.intensidad)||c.intensidad<1||c.intensidad>10) issues.push(`${ref}: intensity 1..10 required`);
    if (!TYPES.includes(c?.tipo)) issues.push(`${ref}: unknown type`);
    if (typeof c?.texto!=='string'||!c.texto.trim()) issues.push(`${ref}: text missing`);
    if (typeof c?.especial !== 'boolean') issues.push(`${ref}: special must be boolean`);
    if (!ALLOWED_PENALTIES.has(c?.castigo)) issues.push(`${ref}: invalid penalty`);
    if (!Number.isInteger(c?.min_jugadores)||c.min_jugadores<2) issues.push(`${ref}: min players`);
    if (!['uno','dos','grupo'].includes(c?.participantes)) issues.push(`${ref}: participation setting`);
    if (c?.tipo==='eventos especiales') {
      if (!Number.isInteger(c['duración_turno'])||c['duración_turno']<1||c['duración_turno']>8) issues.push(`${ref}: event duration`);
      if(c.participacion_obligatoria!==true || c.participantes!=='grupo')issues.push(`${ref}: group event must include everyone`);
      if(typeof c.regla!=='string'||!c.regla.trim())issues.push(`${ref}: missing event rule`);
      if(typeof c.penitencia_social!=='string'||!c.penitencia_social.trim())issues.push(`${ref}: missing social forfeit`);
    } else if ('duración_turno' in (c??{})) issues.push(`${ref}: event duration forbidden outside events`);
    if (!c?.texto?.includes('[player]')) issues.push(`${ref}: [player] token missing`);
    if (['duelo','retos especiales'].includes(c?.tipo)&&!c?.texto?.includes('[player_X]')) issues.push(`${ref}: second player token missing`);
    if (c?.tipo==='hot' && c?.consentimiento!==true) issues.push(`${ref}: hot opt-in flag`);
    if (c?.tipo!=='hot' && c?.consentimiento===true) issues.push(`${ref}: unexpected hot flag`);
    if (['eventos especiales','retos especiales'].includes(c?.tipo) && c?.especial!==true) issues.push(`${ref}: special flag required`);
    counts.set(c?.tipo,(counts.get(c?.tipo)||0)+1);
  });
  for (const t of TYPES) {
    if (t === 'bonus') continue;
    if ((counts.get(t) || 0) < 100) issues.push(`${t}: fewer than 100 cards`);
  }
  return issues;
}

export function canonicalCardId(card, fallbackIndex = 0) {
  if (!card) return fallbackIndex;
  const rawId = card.id;
  if (typeof rawId === 'number') return rawId;
  const match = String(rawId || '').match(/^([a-z]+)_(\d+)$/i);
  if (match) {
    const prefix = match[1].toLowerCase();
    const num = parseInt(match[2], 10);
    const offsets = {
      cla: 0,
      due: 1250,
      yon: 1550,
      yn: 1550,
      qmp: 1850,
      ver: 2150,
      ret: 2650,
      res: 3150,
      rte: 3150,
      eve: 3450,
      hot: 3750,
      bon: 4250,
      chup: 5000
    };
    if (prefix in offsets) {
      return offsets[prefix] + num;
    }
  }
  return rawId ?? fallbackIndex;
}

const metadataKey = (c, i) => [canonicalCardId(c, i),c.intensidad,c.tipo,c.especial,c.castigo,c.min_jugadores,c.participantes,c['duración_turno']??0,c.participacion_obligatoria??false,c.consentimiento].join('|');
export function validateTranslationParity(catalogA,catalogB){
  const a=new Map(catalogA.map((c, i)=>[canonicalCardId(c, i),metadataKey(c, i)]));
  return catalogB.flatMap((c, i)=>a.get(canonicalCardId(c, i))===metadataKey(c, i)?[]:[`Card ${c.id} has mismatched metadata`]);
}

/** Stable state; store it as JSON if a game must be resumed later. */
export function createPreviaMixGame(options){
  assert(options && typeof options==='object','options object required');
  const players=(options.players??[]).map((p,i)=>{
    const name=typeof p==='string'?p:p?.name??p?.nombre;
    const id=typeof p==='string'?`p${i+1}`:p?.id??`p${i+1}`;
    assert(typeof name==='string'&&name.trim(),`player ${i+1}: missing name`);
    return {id:String(id),name:name.trim().slice(0,60)};
  });
  assert(players.length>=2 && players.length<=24,'2 to 24 players required');
  assert(new Set(players.map(p=>p.id)).size===players.length,'player IDs must be unique');
  const locale=options.locale??'es';
  assert(SUPPORTED_LOCALES.includes(locale),'unsupported locale');
  const types=options.enabledTypes??TYPES.filter(t=>t!=='hot');
  assert(Array.isArray(types)&&types.length>0&&types.every(t=>TYPES.includes(t)),'invalid enabledTypes');
  const hotAllowed=allAdult(options.adultsConfirmed)&&allAdult(options.everyoneConsentsHot)&&options.enableHot===true;
  const enabledTypes=[...new Set(types)].filter(t=>t!=='hot'||hotAllowed);
  assert(enabledTypes.length>0 && enabledTypes.some(t=>t!=='eventos especiales' && t!=='bonus'), 'enable at least one non-event type');
  const minIntensity=clamp(Math.floor(Number(options.minIntensity??options.startIntensity??1)||1),1,10);
  const maxIntensity=clamp(Math.floor(Number(options.maxIntensity??10)||10),minIntensity,10);
  const startIntensity=minIntensity;
  const targetTurns=clamp(Math.floor(Number(options.targetTurns??45)||45),5,900);
  const chance=Number(options.eventChance??0.12);
  assert(Number.isFinite(chance)&&chance>=0&&chance<=1,'eventChance must be in [0,1]');
  const noAlcohol=options.noAlcohol!==false;
  const progressiveCurve=options.progressiveCurve!==false;
  return {
    schemaVersion:3,modeId:options.modeId||'previa-mix',locale,players,
    config:{enabledTypes,hotAllowed,minIntensity,startIntensity,maxIntensity,targetTurns,eventChance:chance,
      progressiveCurve,
      noAlcohol,showOptionalDrinkSuggestion:!noAlcohol&&options.showOptionalDrinkSuggestion===true,
      motionReduced:options.motionReduced===true,
      customCardsEnabled:options.customCardsEnabled!==false},
    turn:0,turnsSinceLastBonus:0,recentBonusCardIds:[],usedCardIds:[],history:[],currentCard:null,events:[],eventParticipation:[],
    playerAppearances:Object.fromEntries(players.map(p=>[p.id,0])),
    recentPlayerIds:[],lastType:null,
  };
}

/** Smoothstep curve; controlled by time in game, NOT by drinking/points. */
export function getTargetIntensity(state,nextTurn=state.turn+1){
  const {minIntensity=1,startIntensity:a=minIntensity,maxIntensity:b=10,targetTurns=45}=state.config || {};
  if (state.config?.progressiveCurve===false) {
    return b;
  }
  if (a === b) return a;
  const t=clamp((nextTurn-1)/(targetTurns-1),0,1);
  const smooth=t*t*(3-2*t);
  return Math.round(a+(b-a)*smooth);
}

function playerSelection(state,required,rng){
  const eligible=[...state.players];const chosen=[];
  for(let i=0;i<required;i++){
    const p=weightedPick(eligible,person=>{
      const count=state.playerAppearances[person.id]??0;
      const recent=state.recentPlayerIds.includes(person.id)?0.38:1;
      return recent/Math.sqrt(1+count);
    },rng);
    chosen.push(p);eligible.splice(eligible.indexOf(p),1);
  }
  return chosen;
}

export function getCardPlayerRequirements(card) {
  const text = String(card.texto || '').toLowerCase();
  const hasThird =
    text.includes('[player_x1]') ||
    text.includes('[player_y]') ||
    card.participantes === 'trio' ||
    card.participantes === 'tres' ||
    card.participantes === '3';
  const hasSecond =
    hasThird ||
    text.includes('[player_x]') ||
    card.participantes === 'duo' ||
    card.participantes === 'dos' ||
    card.participantes === '2';
  const hasPrimary =
    text.includes('[player]') ||
    (!hasSecond && !text.includes('[all]') && card.participantes !== 'grupo');
  const isGroup = card.participantes === 'grupo' || text.includes('[all]');

  let requiredCount = 1;
  if (hasThird) {
    requiredCount = 3;
  } else if (hasSecond) {
    requiredCount = 2;
  } else if (isGroup && !hasPrimary) {
    requiredCount = 0;
  }

  const minPlayers = Math.max(card.min_jugadores || 1, requiredCount > 0 ? requiredCount : 2);

  return {
    requiredCount,
    minPlayers,
    hasPrimary,
    hasSecond,
    hasThird,
    isGroup
  };
}

export function fillTokens(template, selected, locale = 'es') {
  const lang = String(locale || 'es').startsWith('en')
    ? 'en'
    : String(locale || 'es').startsWith('pt')
    ? 'pt'
    : 'es';
  const allLabel = lang === 'en' ? 'Everyone' : 'Todos';

  return String(template || '').replace(
    /\[player_x1\]|\[player_x\]|\[player_y\]|\[player_X\]|\[player\]|\[all\]/gi,
    (token) => {
      const lower = token.toLowerCase();
      if (lower === '[player]') return selected[0]?.name || '';
      if (lower === '[player_x]') return selected[1]?.name || '';
      if (lower === '[player_x1]' || lower === '[player_y]') return selected[2]?.name || '';
      if (lower === '[all]') return allLabel;
      return token;
    }
  );
}

function applicableEvents(events,turn) {
  return events.filter(ev=>ev.startsAtTurn<=turn&&ev.expiresAtTurn>=turn);
}

/**
 * Return a NEW game state; never mutate card text or the incoming state.
 * rng is injectable in tests; use Math.random in production.
 */
export function nextPreviaMixCard(state,catalog,rng=Math.random){
  assert(state?.schemaVersion===3 && Array.isArray(state?.players),'invalid game state');
  assert(state.currentCard===null,'resolve the current card before advancing');
  assert(Array.isArray(catalog),'catalog array required');
  const turn=state.turn+1;
  const isProgressive=state.config?.progressiveCurve!==false;
  const maxI=state.config?.maxIntensity??10;
  const startI=state.config?.minIntensity??state.config?.startIntensity??1;
  const target=isProgressive?getTargetIntensity(state,turn):Math.floor(draw(rng)*(maxI-startI+1))+startI;

  // Mecánica Bonus: equilibrada al 5% con cooldown de 7 turnos y pity rule a 18 turnos (mínimo turno 5)
  const bonusAllowed = state.config?.enabledTypes ? state.config.enabledTypes.includes('bonus') : true;
  const turnsSinceBonus = state.turnsSinceLastBonus ?? 0;
  const isCooldownActive = turn < 5 || turnsSinceBonus < 7;
  const shouldTriggerBonus = bonusAllowed && !isCooldownActive && (turnsSinceBonus >= 18 || draw(rng) < 0.05);

  if (shouldTriggerBonus) {
    const bonusCards = getBonusCardsForLocale(state.locale);
    const eligibleBonus = bonusCards.filter(
      (c) => getCardPlayerRequirements(c).minPlayers <= state.players.length
    );
    if (eligibleBonus.length > 0) {
      const recentBonus = state.recentBonusCardIds || [];
      let pool = eligibleBonus.filter((c) => !recentBonus.slice(-2).includes(c.id));
      if (pool.length === 0) pool = eligibleBonus;
      const card = pool[Math.floor(draw(rng) * pool.length)];

      const req = getCardPlayerRequirements(card);
      let neededPlayers = req.requiredCount;
      if (card.subtipo === 'bonus_exclude') {
        neededPlayers = Math.min(card.excludeCount || 1, state.players.length - 1);
      }

      let selected = [];
      if (neededPlayers > 0) {
        selected = playerSelection(state, Math.min(neededPlayers, state.players.length), rng);
      }

      const appearances = { ...state.playerAppearances };
      for (const p of selected) appearances[p.id] = (appearances[p.id] ?? 0) + 1;

      let groupPlayerIds = [];
      let excludedPlayerIds = [];
      if (card.subtipo === 'bonus_exclude') {
        excludedPlayerIds = selected.map((p) => p.id);
        groupPlayerIds = state.players.filter((p) => !excludedPlayerIds.includes(p.id)).map((p) => p.id);
      } else if (req.isGroup || card.participantes === 'grupo') {
        groupPlayerIds = state.players.map((p) => p.id);
      }

      const filledText = fillTokens(card.texto, selected, state.locale);
      const currentCard = {
        ...card,
        textoOriginal: card.texto,
        texto: filledText,
        selectedPlayers: selected,
        excludedPlayerIds,
        groupPlayerIds,
        numeroTurno: turn,
        intensidad: Math.min(state.config.maxIntensity, Math.max(startI, target)),
        intensidadObjetivo: target,
        tipoEtiqueta: 'Bonus 🎁'
      };

      return {
        ...state,
        turn,
        turnsSinceLastBonus: 0,
        recentBonusCardIds: [...recentBonus, card.id].slice(-6),
        events: state.events.filter((ev) => ev.expiresAtTurn >= turn),
        eventParticipation: state.eventParticipation.filter((r) => r.turn >= turn - 1),
        currentCard,
        playerAppearances: appearances,
        recentPlayerIds: [
          ...state.recentPlayerIds,
          ...selected.map((p) => p.id)
        ].slice(-Math.min(state.players.length, 4)),
        lastType: 'bonus'
      };
    }
  }

  const activeEvents = applicableEvents(state.events, turn);
  const allowed = catalog.filter(
    (c) =>
      state.config.enabledTypes.includes(c.tipo) &&
      getCardPlayerRequirements(c).minPlayers <= state.players.length &&
      c.intensidad >= startI &&
      c.intensidad <= state.config.maxIntensity &&
      (c.tipo !== 'hot' || state.config.hotAllowed)
  );
  assert(allowed.length > 0, 'no cards match these settings');
  // Avoid repeats until every eligible ID has been seen; the curve may widen before that.
  let used = state.usedCardIds;
  let pool = allowed.filter((c) => !used.includes(c.id));
  if (pool.length === 0) {
    used = [];
    pool = allowed;
  }
  if (activeEvents.length) pool = pool.filter((c) => c.tipo !== 'eventos especiales');
  if (!pool.length) {
    used = [];
    pool = allowed.filter((c) => !activeEvents.length || c.tipo !== 'eventos especiales');
  }
  assert(pool.length > 0, 'no cards available with active events');
  // Prefer exact target (or widen if exhausted) so random intensities distribute cleanly 1..10.
  let band = [];
  for (let radius = 0; radius <= 9; radius++) {
    band = pool.filter((c) => Math.abs(c.intensidad - target) <= radius);
    if (band.length) break;
  }
  assert(band.length > 0, 'no card in intensity range');
  const eventCards = band.filter((c) => c.tipo === 'eventos especiales');
  const regularCards = band.filter((c) => c.tipo !== 'eventos especiales');
  const chooseEvent =
    eventCards.length > 0 &&
    (regularCards.length === 0 || draw(rng) < state.config.eventChance);
  const working = chooseEvent ? eventCards : regularCards;
  // All categories and cards are random; slight balancing prevents one type dominating.
  const counts = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const h of state.history.slice(-40)) counts[h.tipo] = (counts[h.tipo] ?? 0) + 1;
  const card = weightedPick(
    working,
    (c) => {
      const closeness = Math.pow(0.48, Math.abs(c.intensidad - target));
      const recentType = c.tipo === state.lastType ? 0.7 : 1;
      return (closeness * recentType) / (1 + counts[c.tipo] * 0.13);
    },
    rng
  );
  const req = getCardPlayerRequirements(card);
  const selected =
    req.requiredCount > 0
      ? playerSelection(state, Math.min(req.requiredCount, state.players.length), rng)
      : [];
  const appearances = { ...state.playerAppearances };
  for (const p of selected) appearances[p.id] = (appearances[p.id] ?? 0) + 1;
  const currentCard = {
    ...card,
    textoOriginal: card.texto,
    texto: fillTokens(card.texto, selected, state.locale),
    selectedPlayers: selected,
    groupPlayerIds: req.isGroup || card.participantes === 'grupo' ? state.players.map((p) => p.id) : [],
    numeroTurno: turn,
    intensidadObjetivo: target,
    tipoEtiqueta: (card.especial ? '★ ' : '') + card.tipo
  };
  return {...state,turn,
    turnsSinceLastBonus: turnsSinceBonus + 1,
    recentBonusCardIds: state.recentBonusCardIds || [],
    usedCardIds:[...used,card.id],
    events:state.events.filter(ev=>ev.expiresAtTurn>=turn),
    eventParticipation:state.eventParticipation.filter(r=>r.turn>=turn-1),currentCard,
    playerAppearances:appearances,
    recentPlayerIds:[...state.recentPlayerIds,...selected.map(p=>p.id)].slice(-Math.min(state.players.length,4)),
    lastType:card.tipo};
}

/**
 * During each active group event, every player has a status for that turn:
 * participated OR forfeit (a harmless, non-alcoholic social task). No drinking is forced.
 * Outcome is only an in-session rule acknowledgment; there is NO points tally.
 */
export function recordGroupEventOutcome(state,{eventId,playerId,outcome}){
  assert(state?.schemaVersion===3 && state.currentCard,'a current card is required');
  assert(['participated','forfeit'].includes(outcome),'outcome must be participated or forfeit');
  assert(state.players.some(p=>p.id===playerId),'unknown player');
  const active=applicableEvents(state.events,state.turn).find(ev=>ev.id===eventId);
  assert(active,'event is not active on this turn');
  const prev=state.eventParticipation.filter(x=>!(x.turn===state.turn&&x.eventId===eventId&&x.playerId===playerId));
  return {state:{...state,eventParticipation:[...prev,{turn:state.turn,eventId,playerId,outcome}]},
    socialForfeit:outcome==='forfeit'?active.penitencia_social:null};
}

export function getPendingGroupEventPlayers(state){
  assert(state?.schemaVersion===3,'invalid state');
  return applicableEvents(state.events,state.turn).map(ev=>({
    eventId:ev.id,turn:state.turn,rule:ev.regla,
    players:state.players.filter(p=>!state.eventParticipation.some(x=>x.turn===state.turn && x.eventId===ev.id && x.playerId===p.id))
  }));
}

/** Normal questions can be skipped. Group-event activation cards cannot be silently skipped;
 * the party may still end the game at any time, and any person may decline a task.
 */
export function resolvePreviaMixCard(state,result){
  assert(state?.currentCard,'no active card to resolve');
  assert(['completed','skipped'].includes(result),"result must be 'completed' or 'skipped'");
  const card=state.currentCard;
  if(card.tipo==='eventos especiales' && result==='skipped')
    throw new Error('[Previa Mix] group event activation cannot be silently skipped; use end game if the group does not wish to continue');
  const pending=getPendingGroupEventPlayers(state);
  if(pending.some(ev=>ev.players.length))
    throw new Error('[Previa Mix] record participated or social forfeit for all players in active group events before ending this turn');
  const events=[...state.events];
  if(card.tipo==='eventos especiales'){
    events.push({id:card.id,rule:card.regla,penitencia_social:card.penitencia_social,
      startsAtTurn:state.turn+1,expiresAtTurn:state.turn+card['duración_turno'],
      totalTurns:card['duración_turno']});
  }
  const history=[...state.history,{id:card.id,tipo:card.tipo,intensidad:card.intensidad,
    turn:state.turn,result,players:card.selectedPlayers.map(p=>p.id)}].slice(-MAX_SESSION_HISTORY);
  const optionalDrinkSuggestion=(result==='skipped'&&state.config.showOptionalDrinkSuggestion)?card.castigo:null;
  return {state:{...state,currentCard:null,events,history},optionalDrinkSuggestion,
    note:result==='skipped'?'You can decline any card without compulsory drinking.':null};
}
export function getActivePreviaMixEvents(state){
  return applicableEvents(state.events,state.turn).map(e=>({ ...e,turnsRemaining:e.expiresAtTurn-state.turn+1 }));
}

/** Optional user-facing labels; IDs/categories always remain stable across languages. */
export const TYPE_LABELS={
  'es':['Clásico','Duelo','Yo nunca','¿Quién es más probable?','Verdad','Reto','Reto especial','Evento especial','Hot +18','Bonus 🎁','Verdad Hot 🌶️','Reto Hot ⚡','Yo Nunca Hot 🙈','¿Quién Hot? 👑','Cultura Hot 🍹'],
  'en':['Classic','Duel','Never Have I Ever','Most Likely To','Truth','Dare','Special Dare','Special Event','Hot +18','Bonus 🎁','Truth Hot 🌶️','Dare Hot ⚡','Never Have I Ever Hot 🙈','Who Most Likely Hot 👑','Spicy Trivia 🍹'],
  'pt':['Clássico','Duelo','Eu Nunca','Quem é Mais Provável','Verdade','Desafio','Desafio Especial','Evento Especial','Hot +18','Bônus 🎁','Verdade Hot 🌶️','Desafio Hot ⚡','Eu Nunca Hot 🙈','Quem É Mais Provável Hot 👑','Cultura Hot 🍹'],
  'es-CO':['Clásico','Duelo','Yo nunca','¿Quién es más probable?','Verdad','Reto','Reto especial','Evento especial','Hot +18','Bonus 🎁','Verdad Hot 🌶️','Reto Hot ⚡','Yo Nunca Hot 🙈','¿Quién Hot? 👑','Cultura Hot 🍹'],
  'es-MX':['Clásico','Duelo','Yo nunca','¿Quién es más probable?','Verdad','Reto','Reto especial','Evento especial','Hot +18','Bonus 🎁','Verdad Hot 🌶️','Reto Hot ⚡','Yo Nunca Hot 🙈','¿Quién Hot? 👑','Cultura Hot 🍹'],
  'es-ES':['Clásico','Duelo','Yo nunca','¿Quién es más probable?','Verdad','Reto','Reto especial','Evento especial','Hot +18','Bonus 🎁','Verdad Hot 🌶️','Reto Hot ⚡','Yo Nunca Hot 🙈','¿Quién Hot? 👑','Cultura Hot 🍹'],
  'en-US':['Classic','Duel','Never Have I Ever','Most Likely To','Truth','Dare','Special Dare','Special Event','Hot +18','Bonus 🎁','Truth Hot 🌶️','Dare Hot ⚡','Never Have I Ever Hot 🙈','Who Most Likely Hot 👑','Spicy Trivia 🍹'],
  'en-GB':['Classic','Duel','Never Have I Ever','Most Likely To','Truth','Dare','Special Dare','Special Event','Hot +18','Bonus 🎁','Truth Hot 🌶️','Dare Hot ⚡','Never Have I Ever Hot 🙈','Who Most Likely Hot 👑','Spicy Trivia 🍹'],
  'pt-BR':['Clássico','Duelo','Eu Nunca','Quem é Mais Provável','Verdade','Desafio','Desafio Especial','Evento Especial','Hot +18','Bônus 🎁','Verdade Hot 🌶️','Desafio Hot ⚡','Eu Nunca Hot 🙈','Quem É Mais Provável Hot 👑','Cultura Hot 🍹'],
  'pt-PT':['Clássico','Duelo','Eu Nunca','Quem é Mais Provável','Verdade','Desafio','Desafio Especial','Evento Especial','Hot +18','Bônus 🎁','Verdade Hot 🌶️','Desafio Hot ⚡','Eu Nunca Hot 🙈','Quem É Mais Provável Hot 👑','Cultura Hot 🍹'],
};
export function getCardTypeLabel(card,locale='es'){
  if(card?.tipo === 'bonus' || card?.isBonus) return locale?.startsWith('pt') ? 'Bônus 🎁' : 'Bonus 🎁';
  const idx=TYPES.indexOf(card?.tipo);
  const labels = TYPE_LABELS[locale] ?? TYPE_LABELS['es'];
  if (idx >= 0 && labels && labels[idx]) {
    return (card?.especial ? '★ ' : '') + labels[idx];
  }
  return card?.tipo || 'Hot +18';
}
export const PENALTY_LABELS = {
  'es': { 'sorbo': 'sorbo', 'medio trago': 'medio trago', '1 trago': '1 trago', 'half a drink': 'medio trago', 'one drink': '1 trago', 'a sip': 'sorbo' },
  'en': { 'sorbo': 'a sip', 'medio trago': 'half a drink', '1 trago': 'one drink', 'half a drink': 'half a drink', 'one drink': 'one drink', 'a sip': 'a sip', '1 drink': '1 drink', 'meio gole': 'half a drink' },
  'pt': { 'sorbo': 'um gole', 'medio trago': 'meio copo', '1 trago': 'um copo', 'half a drink': 'meio gole', 'one drink': 'um copo', 'a sip': 'um gole', '1 drink': 'um gole', 'meio gole': 'meio gole' },
  'es-CO': { 'sorbo': 'sorbo', 'medio trago': 'medio trago', '1 trago': '1 trago', 'half a drink': 'medio trago', 'one drink': '1 trago', 'a sip': 'sorbo' },
  'es-MX': { 'sorbo': 'sorbito', 'medio trago': 'medio trago', '1 trago': '1 trago', 'half a drink': 'medio trago', 'one drink': '1 trago', 'a sip': 'sorbito' },
  'es-ES': { 'sorbo': 'sorbo', 'medio trago': 'medio trago', '1 trago': '1 trago', 'half a drink': 'medio trago', 'one drink': '1 trago', 'a sip': 'sorbo' },
  'en-US': { 'sorbo': 'a sip', 'medio trago': 'half a drink', '1 trago': 'one drink', 'half a drink': 'half a drink', 'one drink': 'one drink', 'a sip': 'a sip', '1 drink': '1 drink', 'meio gole': 'half a drink' },
  'en-GB': { 'sorbo': 'a sip', 'medio trago': 'half a drink', '1 trago': 'one drink', 'half a drink': 'half a drink', 'one drink': 'one drink', 'a sip': 'a sip', '1 drink': '1 drink', 'meio gole': 'half a drink' },
  'pt-BR': { 'sorbo': 'um gole', 'medio trago': 'meio copo', '1 trago': 'um copo', 'half a drink': 'meio gole', 'one drink': 'um copo', 'a sip': 'um gole', '1 drink': 'um gole', 'meio gole': 'meio gole' },
  'pt-PT': { 'sorbo': 'um gole', 'medio trago': 'meia bebida', '1 trago': 'uma bebida', 'half a drink': 'meio golo', 'one drink': 'uma bebida', 'a sip': 'um gole', '1 drink': 'um golo', 'meio gole': 'meio golo' }
};
export function getOptionalPenaltyLabel(castigo,locale='es'){
 return (PENALTY_LABELS[locale]??PENALTY_LABELS['es'])[castigo]??castigo;
}
