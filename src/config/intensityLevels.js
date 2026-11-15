/**
 * Oh My Shot! — Niveles de Intensidad Máxima (1 a 10).
 * Configuración visual y descriptiva con nombres temáticos de fiesta.
 */

export const INTENSITY_LEVELS = Object.freeze([
  {
    level: 1,
    accent: '#4ade80',
    iconImg: './assets/icons/levels/level_01.webp',
    name: {
      es: '1 - Tranqui',
      en: '1 - Chill',
      pt: '1 - Tranquilo'
    },
    subtitle: {
      es: 'Suave y relajado',
      en: 'Soft & relaxed',
      pt: 'Suave e relaxado'
    },
    desc: {
      es: 'Para arrancar sin prisas, romper el hielo y charlar tranquilamente.',
      en: 'Easy start to break the ice and chat casually without pressure.',
      pt: 'Para começar sem pressa, quebrar o gelo e conversar na boa.'
    }
  },
  {
    level: 2,
    accent: '#38bdf8',
    iconImg: './assets/icons/levels/level_02.webp',
    name: {
      es: '2 - Suave',
      en: '2 - Mellow',
      pt: '2 - Suave'
    },
    subtitle: {
      es: 'Risas ligeras',
      en: 'Light giggles',
      pt: 'Risadas leves'
    },
    desc: {
      es: 'Preguntas cómodas, anécdotas ligeras y los primeros sorbos de la noche.',
      en: 'Comfortable questions, fun stories and first sips of the night.',
      pt: 'Perguntas confortáveis, histórias divertidas e os primeiros goles da noite.'
    }
  },
  {
    level: 3,
    accent: '#2dd4bf',
    iconImg: './assets/icons/levels/level_03.webp',
    name: {
      es: '3 - Entonando',
      en: '3 - Warming Up',
      pt: '3 - Aquecendo'
    },
    subtitle: {
      es: 'El ambiente se anima',
      en: 'Vibe is heating up',
      pt: 'O clima esquenta'
    },
    desc: {
      es: 'El grupo entra en confianza y los retos empiezan a soltar las lenguas.',
      en: 'Everyone starts opening up and the dares get the conversation going.',
      pt: 'A galera ganha confiança e os desafios começam a soltar a língua.'
    }
  },
  {
    level: 4,
    accent: '#facc15',
    iconImg: './assets/icons/levels/level_04.webp',
    name: {
      es: '4 - En Marcha',
      en: '4 - Cruising',
      pt: '4 - No Pique'
    },
    subtitle: {
      es: 'Ritmo constante',
      en: 'Steady groove',
      pt: 'Ritmo constante'
    },
    desc: {
      es: 'Curiosidades picadas, risas compartidas y tragos más frecuentes.',
      en: 'Curious reveals, shared laughter and drinks flowing more often.',
      pt: 'Curiosidades instigantes, risadas juntas e goles mais frequentes.'
    }
  },
  {
    level: 5,
    accent: '#fb923c',
    iconImg: './assets/icons/levels/level_05.webp',
    name: {
      es: '5 - Intermedio',
      en: '5 - Intermediate',
      pt: '5 - Intermediário'
    },
    subtitle: {
      es: 'Equilibrio perfecto',
      en: 'The sweet spot',
      pt: 'Equilíbrio perfeito'
    },
    desc: {
      es: 'El balance ideal de fiesta: diversión garantizada, picardía y buen ambiente.',
      en: 'The ideal party balance: guaranteed fun, cheeky banter and great energy.',
      pt: 'O equilíbrio ideal de festa: diversão garantida, malícia e ótima energia.'
    }
  },
  {
    level: 6,
    accent: '#f97316',
    iconImg: './assets/icons/levels/level_06.webp',
    name: {
      es: '6 - Picante',
      en: '6 - Spicy',
      pt: '6 - Picante'
    },
    subtitle: {
      es: 'Sube el calor',
      en: 'Turning up the heat',
      pt: 'Sobe a temperatura'
    },
    desc: {
      es: 'Confesiones atrevidas, verdades directas y retos con más sabor.',
      en: 'Bold confessions, direct truths and dares with a kick.',
      pt: 'Confissões ousadas, verdades diretas e desafios mais provocantes.'
    }
  },
  {
    level: 7,
    accent: '#ff5480',
    iconImg: './assets/icons/levels/level_07.webp',
    name: {
      es: '7 - Caliente',
      en: '7 - Hot',
      pt: '7 - Quente'
    },
    subtitle: {
      es: 'Cero vergüenza',
      en: 'Zero shame',
      pt: 'Zero vergonha'
    },
    desc: {
      es: 'La previa se pone seria: preguntas comprometedoras y tragos inevitables.',
      en: 'Party is getting serious: compromising questions and inevitable drinks.',
      pt: 'A prévia esquenta de verdade: perguntas comprometedoras e goles inevitáveis.'
    }
  },
  {
    level: 8,
    accent: '#ef4444',
    iconImg: './assets/icons/levels/level_08.webp',
    name: {
      es: '8 - Fuego',
      en: '8 - On Fire',
      pt: '8 - Em Chamas'
    },
    subtitle: {
      es: 'Ambiente en llamas',
      en: 'Room on fire',
      pt: 'Clima pegando fogo'
    },
    desc: {
      es: 'Duelos intensos, verdades sin filtro y castigos que no perdonan.',
      en: 'Intense face-offs, raw truths and unforgiving forfeits.',
      pt: 'Duelos intensos, verdades sem filtro e prendas imperdoáveis.'
    }
  },
  {
    level: 9,
    accent: '#d946ef',
    iconImg: './assets/icons/levels/level_09.webp',
    name: {
      es: '9 - Descontrol',
      en: '9 - Wild',
      pt: '9 - Descontrole'
    },
    subtitle: {
      es: 'Solo para valientes',
      en: 'Brave souls only',
      pt: 'Só para corajosos'
    },
    desc: {
      es: 'Nivel avanzado de fiesta para grupos con alta tolerancia y ganas de desmadre.',
      en: 'High-octane party level for fearless crews ready to go wild.',
      pt: 'Nível avançado de festa para grupos sem medo de tocar o terror.'
    }
  },
  {
    level: 10,
    accent: '#a855f7',
    iconImg: './assets/icons/levels/level_10.webp',
    name: {
      es: '10 - Sin Censura',
      en: '10 - No Filter',
      pt: '10 - Sem Censura'
    },
    subtitle: {
      es: 'Máxima intensidad',
      en: 'Maximum intensity',
      pt: 'Intensidade máxima'
    },
    desc: {
      es: 'El límite extremo de Oh My Shot: cartas al máximo poder, locura y fiesta total.',
      en: 'Oh My Shot absolute ceiling: max power cards, pure madness and total hype.',
      pt: 'O limite extremo de Oh My Shot: cartas na potência máxima e loucura total.'
    }
  }
]);

export function getIntensityLevel(levelNumber) {
  const num = Math.min(10, Math.max(1, Math.round(Number(levelNumber) || 10)));
  return INTENSITY_LEVELS.find((l) => l.level === num) || INTENSITY_LEVELS[INTENSITY_LEVELS.length - 1];
}

export function getLocalizedIntensityInfo(levelNumber, lang = 'es') {
  const item = getIntensityLevel(levelNumber);
  const safeLang = lang === 'en' ? 'en' : lang === 'pt' ? 'pt' : 'es';
  return {
    level: item.level,
    accent: item.accent,
    iconImg: item.iconImg,
    name: item.name[safeLang] || item.name.es,
    subtitle: item.subtitle[safeLang] || item.subtitle.es,
    desc: item.desc[safeLang] || item.desc.es
  };
}

export function getLocalizedIntensityRangeInfo(minLevel, maxLevel, lang = 'es') {
  const min = Math.min(10, Math.max(1, Math.round(Number(minLevel) || 1)));
  const max = Math.min(10, Math.max(min, Math.round(Number(maxLevel) || min)));
  const safeLang = lang === 'en' ? 'en' : lang === 'pt' ? 'pt' : 'es';

  const minInfo = getLocalizedIntensityInfo(min, safeLang);
  const maxInfo = getLocalizedIntensityInfo(max, safeLang);

  if (min === max) {
    const singleBadge = safeLang === 'en'
      ? `LEVEL ${min}`
      : safeLang === 'pt'
        ? `NÍVEL ${min}`
        : `NIVEL ${min}`;
    const singleTagline = safeLang === 'en'
      ? `Single Level ${min}`
      : safeLang === 'pt'
        ? `Apenas Nível ${min}`
        : `Solo Nivel ${min}`;

    return {
      isRange: false,
      min,
      max,
      badgeText: singleBadge,
      taglineText: singleTagline,
      name: minInfo.name,
      subtitle: minInfo.subtitle,
      desc: minInfo.desc,
      accent: minInfo.accent,
      iconImg: minInfo.iconImg
    };
  }

  const rangeBadge = safeLang === 'en'
    ? `LEVELS ${min} - ${max}`
    : safeLang === 'pt'
      ? `NÍVEIS ${min} - ${max}`
      : `NIVELES ${min} - ${max}`;

  const rangeTagline = safeLang === 'en'
    ? `Range: ${min} to ${max}`
    : safeLang === 'pt'
      ? `Faixa: ${min} a ${max}`
      : `Rango: ${min} a ${max}`;

  const minCleanName = (minInfo.name || '').replace(/^\d+\s*-\s*/, '');
  const maxCleanName = (maxInfo.name || '').replace(/^\d+\s*-\s*/, '');
  const rangeName = `${minCleanName} a ${maxCleanName}`;
  const rangeSubtitle = `${minInfo.subtitle} ➔ ${maxInfo.subtitle}`;

  const rangeDesc = safeLang === 'en'
    ? `Only cards between levels ${min} and ${max} will appear. The curve will progress within this range.`
    : safeLang === 'pt'
      ? `Apenas cartas entre os níveis ${min} e ${max} aparecerão. A curva progredirá nesta faixa.`
      : `En la partida solo saldrán cartas entre nivel ${min} y ${max}. La curva de juego progresará en este rango.`;

  return {
    isRange: true,
    min,
    max,
    badgeText: rangeBadge,
    taglineText: rangeTagline,
    name: rangeName,
    subtitle: rangeSubtitle,
    desc: rangeDesc,
    accent: maxInfo.accent,
    iconImg: maxInfo.iconImg
  };
}

