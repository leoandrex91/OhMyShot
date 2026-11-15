#!/usr/bin/env python3
"""
Compilador y Localizador Modular de Previa Mix
Oh My Shot!
Traduce y adapta coloquialmente las 4,250 cartas de es-CO hacia:
- es-MX (Español de México)
- es-ES (Español de España)
- en-US (English US)
- en-GB (English UK)
- pt-BR (Português Brasil)
- pt-PT (Português Portugal)

Crea 9 archivos modulares por tipo en cada carpeta regional y el agregador central.
"""

import json
import os
import re
import importlib.util
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(ROOT, "src", "modes", "previa-mix", "locales")
ES_CO_DIR = os.path.join(LOCALES_DIR, "es-CO")

CARD_TYPES_CONFIG = [
    ("clásico", "clasico", "clasicoCards"),
    ("duelo", "duelo", "dueloCards"),
    ("yo nunca", "yo-nunca", "yoNuncaCards"),
    ("quien es más probable", "quien-es-mas-probable", "quienEsMasProbableCards"),
    ("verdad", "verdad", "verdadCards"),
    ("reto", "reto", "retoCards"),
    ("retos especiales", "retos-especiales", "retosEspecialesCards"),
    ("eventos especiales", "eventos-especiales", "eventosEspecialesCards"),
    ("hot", "hot", "hotCards"),
]

# 1. Cargar semillas tripartitas (es ~ en ~ pt)
SEEDS_MAP = {}
extra_seeds_path = Path(ROOT) / 'logicas' / 'Previa Mix' / 'scripts' / 'extra_seeds.txt'
if extra_seeds_path.exists():
    for line in extra_seeds_path.read_text(encoding='utf-8').splitlines():
        if line.startswith('==') or not line.strip():
            continue
        parts = [p.strip() for p in line.split('~')]
        if len(parts) == 3:
            es, en, pt = parts
            SEEDS_MAP[es.lower()] = {'en': en, 'pt': pt}

seeds_py = Path(ROOT) / 'logicas' / 'Previa Mix' / 'scripts' / 'source_seeds.py'
if seeds_py.exists():
    spec = importlib.util.spec_from_file_location('seed', str(seeds_py))
    s = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(s)
    for cat in ['CLASSIC', 'DUEL', 'NEVER', 'LIKELY', 'TRUTH', 'CHALLENGE', 'SPECIAL', 'EVENT_RULES', 'HOT_PAIRS']:
        val = getattr(s, cat, None)
        if isinstance(val, dict) and 'es' in val and 'en' in val and 'pt' in val:
            for es, en, pt in zip(val['es'], val['en'], val['pt']):
                SEEDS_MAP[es.lower()] = {'en': en, 'pt': pt}

# Diccionario de castigos estándar
CASTIGO_MAP = {
    'es-MX': {
        'Si falla': 'Si falla se echa',
        'Si fallan': 'Si fallan se echan',
        'Si no responde': 'Si no contesta se echa',
        'Si no responden': 'Si no contestan se echan',
        'Si no contesta': 'Si no contesta se echa',
        'Si no cumple': 'Si no cumple se echa',
        'Si no cumplen': 'Si no cumplen se echan',
        'Quien pierda': 'Quien pierda se echa',
        'Quien lo hizo': 'Quien lo hizo se echa',
        'El más votado': 'El más votado se echa',
        'Quien no cumpla': 'Quien no cumpla se echa',
        'Si alguien no lo hace': 'Si alguien se raja'
    },
    'es-ES': {
        'Si falla': 'Si falla bebe',
        'Si fallan': 'Si fallan beben',
        'Si no responde': 'Si no responde bebe',
        'Si no responden': 'Si no responden beben',
        'Si no contesta': 'Si no contesta bebe',
        'Si no cumple': 'Si no cumple bebe',
        'Si no cumplen': 'Si no cumplen beben',
        'Quien pierda': 'Quien pierda bebe',
        'Quien lo hizo': 'Quien lo haya hecho bebe',
        'El más votado': 'El más votado bebe',
        'Quien no cumpla': 'Quien no cumpla bebe',
        'Si alguien no lo hace': 'Si alguien no lo hace bebe'
    },
    'en-US': {
        'Si falla': 'If they fail',
        'Si fallan': 'If they fail',
        'Si no responde': 'If they refuse',
        'Si no responden': 'If they refuse',
        'Si no contesta': 'If they refuse',
        'Si no cumple': 'If they do not comply',
        'Si no cumplen': 'If they do not comply',
        'Quien pierda': 'Whoever loses',
        'Quien lo hizo': 'Whoever did it',
        'El más votado': 'The most voted',
        'Quien no cumpla': 'Whoever does not comply',
        'Si alguien no lo hace': 'If anyone fails to do so'
    },
    'en-GB': {
        'Si falla': 'If they fail, forfeit',
        'Si fallan': 'If they fail, forfeit',
        'Si no responde': 'If they bottle it',
        'Si no responden': 'If they bottle it',
        'Si no contesta': 'If they bottle it',
        'Si no cumple': 'If they bottle the dare',
        'Si no cumplen': 'If they bottle the dare',
        'Quien pierda': 'Whoever loses, forfeit',
        'Quien lo hizo': 'Whoever did it, forfeit',
        'El más votado': 'The most voted, forfeit',
        'Quien no cumpla': 'Whoever bottles it',
        'Si alguien no lo hace': 'If anyone fails to join in'
    },
    'pt-BR': {
        'Si falla': 'Se errar toma',
        'Si fallan': 'Se errarem tomam',
        'Si no responde': 'Se não responder toma',
        'Si no responden': 'Se não responderem tomam',
        'Si no contesta': 'Se não responder toma',
        'Si no cumple': 'Se não cumprir toma',
        'Si no cumplen': 'Se não cumprirem tomam',
        'Quien pierda': 'Quem perder toma',
        'Quien lo hizo': 'Quem já fez toma',
        'El más votado': 'O mais votado toma',
        'Quien no cumpla': 'Quem não cumprir toma',
        'Si alguien no lo hace': 'Se alguém não fizer toma'
    },
    'pt-PT': {
        'Si falla': 'Se falhar bebe',
        'Si fallan': 'Se falharem bebem',
        'Si no responde': 'Se não responder bebe',
        'Si no responden': 'Se não responderem bebem',
        'Si no contesta': 'Se não responder bebe',
        'Si no cumple': 'Se não cumprir bebe',
        'Si no cumplen': 'Se não cumprirem bebem',
        'Quien pierda': 'Quem perder bebe',
        'Quien lo hizo': 'Quem já fez bebe',
        'El más votado': 'O mais votado bebe',
        'Quien no cumpla': 'Quem não cumprir bebe',
        'Si alguien no lo hace': 'Se alguém não fizer bebe'
    }
}

def adapt_castigo(castigo_str, locale):
    if not castigo_str or locale == 'es-CO':
        return castigo_str
    
    mapping = CASTIGO_MAP.get(locale, {})
    res = castigo_str
    for k, v in mapping.items():
        if k in res:
            res = res.replace(k, v)
            break
            
    if locale in ('en-US', 'en-GB'):
        res = res.replace('o [castigo_notoma{x}]', 'or [castigo_notoma{x}]')
    elif locale in ('pt-BR', 'pt-PT'):
        res = res.replace('o [castigo_notoma{x}]', 'ou [castigo_notoma{x}]')
        
    return res

# Reglas léxicas para variantes en español
LEX_ES_MX = [
    (r'\bamigos\b', 'compas'),
    (r'\bamigo\b', 'compa'),
    (r'\bcerveza\b', 'chela'),
    (r'\bcervezas\b', 'chelas'),
    (r'\bexpareja\b', 'ex'),
    (r'\bcelular\b', 'cel'),
    (r'\bcomputadora\b', 'compu'),
    (r'\bchiste\b', 'cotorreo'),
    (r'\bvergüenza\b', 'oso'),
    (r'\bpena\b', 'oso'),
    (r'\benojado\b', 'encabronado'),
    (r'\bdescarado\b', 'cínico'),
    (r'\bronda\b', 'tanda'),
    (r'\btrago\b', 'shot'),
    (r'\bhablando con\b', 'platicando con'),
    (r'\bhablar de\b', 'platicar de'),
    (r'\bhablan de\b', 'platican de')
]

LEX_ES_ES = [
    (r'\bamigos\b', 'colegas'),
    (r'\bamigo\b', 'colega'),
    (r'\bcerveza\b', 'caña'),
    (r'\bcervezas\b', 'cañas'),
    (r'\bexpareja\b', 'ex'),
    (r'\bcelular\b', 'móvil'),
    (r'\bcomputadora\b', 'ordenador'),
    (r'\bvergüenza\b', 'corte'),
    (r'\bpena\b', 'corte'),
    (r'\benojado\b', 'cabreado'),
    (r'\bhacer trampa\b', 'hacer trampas'),
    (r'\btrago\b', 'chupito'),
    (r'\btragos\b', 'chupitos')
]

# Patrones de traducción de trivia
TRIVIA_TEMPLATES = [
    (r'^¿Cuál es la capital de ([^?]+)\? \[.*?\]', r'What is the capital of \1? [?] ', r'Qual é a capital de \1? [?] '),
    (r'^¿Qué planeta es conocido como ([^?]+)\? \[.*?\]', r'Which planet is known as \1? [?] ', r'Qual planeta é conhecido como \1? [?] '),
    (r'^¿En qué país se encuentra ([^?]+)\? \[.*?\]', r'In which country is \1 located? [?] ', r'Em que país fica \1? [?] '),
    (r'^¿Cuántos lados tiene ([^?]+)\? \[.*?\]', r'How many sides does \1 have? [?] ', r'Quantos lados tem \1? [?] '),
    (r'^¿Qué río atraviesa ([^?]+)\? \[.*?\]', r'Which river flows through \1? [?] ', r'Que rio atravessa \1? [?] '),
    (r'^¿En qué año cayó ([^?]+)\? \[.*?\]', r'In what year did \1 fall? [?] ', r'Em que ano caiu \1? [?] '),
    (r'^¿En qué año se firmó ([^?]+)\? \[.*?\]', r'In what year was \1 signed? [?] ', r'Em que ano foi assinado \1? [?] '),
    (r'^¿Qué filósofo griego fue ([^?]+)\? \[.*?\]', r'Which Greek philosopher was \1? [?] ', r'Que filósofo grego foi \1? [?] '),
    (r'^¿Quién escribió ([^?]+)\? \[.*?\]', r'Who wrote \1? [?] ', r'Quem escreveu \1? [?] '),
    (r'^¿Cuál es el océano más ([^?]+)\? \[.*?\]', r'What is the most \1 ocean? [?] ', r'Qual é o oceano mais \1? [?] '),
    (r'^¿Qué elemento químico tiene el símbolo ([^?]+)\? \[.*?\]', r'Which chemical element has the symbol \1? [?] ', r'Qual elemento químico tem o símbolo \1? [?] '),
    (r'^¿Quién pintó ([^?]+)\? \[.*?\]', r'Who painted \1? [?] ', r'Quem pintou \1? [?] '),
    (r'^¿En qué año llegó el ser humano a la Luna\? \[.*?\]', r'In what year did man land on the Moon? [?] ', r'Em que ano o ser humano pisou a Lua? [?] ')
]

# Vocabulario de sustitución común ES -> EN y ES -> PT
PHRASE_TRANSLATIONS = {
    'el planeta rojo': ('the Red Planet', 'o Planeta Vermelho'),
    'la Torre Eiffel': ('the Eiffel Tower', 'a Torre Eiffel'),
    'un hexágono': ('a hexagon', 'um hexágono'),
    'la ciudad de París': ('the city of Paris', 'a cidade de Paris'),
    'Constantinopla': ('Constantinople', 'Constantinopla'),
    'maestro de Alejandro Magno': ('teacher of Alexander the Great', 'mestre de Alexandre o Grande'),
    'los Teoremas de Incompletitud': ('the Incompleteness Theorems', 'os Teoremas da Incompletude'),
    'la Gioconda': ('the Mona Lisa', 'a Mona Lisa'),
    'Don Quijote': ('Don Quixote', 'Dom Quixote'),
    'Romeo y Julieta': ('Romeo and Juliet', 'Romeu e Julieta')
}

def translate_phrase(text, target_lang):
    res = text
    for es_p, (en_p, pt_p) in PHRASE_TRANSLATIONS.items():
        if es_p in res:
            res = res.replace(es_p, en_p if target_lang == 'en' else pt_p)
    return res

def localize_text(text, locale, card_type):
    if not text:
        return text
    
    res = text
    
    # 1. Variantes de español
    if locale == 'es-MX':
        for pattern, repl in LEX_ES_MX:
            res = re.sub(pattern, repl, res, flags=re.IGNORECASE)
        if card_type == 'quien es más probable':
            res = res.replace('¿Quién es más probable que', '¿Quién de la bola es más probable que')
        elif card_type == 'verdad':
            res = res.replace('Verdad: ¿Alguna vez has', 'La neta: ¿Alguna vez te has')
        elif card_type == 'eventos especiales':
            res = res.replace('EVENTO GRUPAL:', 'REGLA DE LA PEDA:')
        return res
        
    elif locale == 'es-ES':
        for pattern, repl in LEX_ES_ES:
            res = re.sub(pattern, repl, res, flags=re.IGNORECASE)
        if card_type == 'quien es más probable':
            res = res.replace('¿Quién es más probable que', '¿Quién de la peña es más probable que')
        elif card_type == 'eventos especiales':
            res = res.replace('EVENTO GRUPAL:', 'EVENTO DE BOTELLÓN:')
        return res
        
    # 2. Inglés (en-US / en-GB)
    elif locale.startswith('en-'):
        res = res.replace(' y [player_x]', ' and [player_x]').replace(' y [player_x1]', ' and [player_x1]')
        # Check Trivia templates
        matched_trivia = False
        for pat, en_tpl, _ in TRIVIA_TEMPLATES:
            if re.search(pat, res):
                res = re.sub(pat, en_tpl, res)
                res = translate_phrase(res, 'en')
                matched_trivia = True
                break
                
        if not matched_trivia:
            # Reemplazo de prefijos centrales
            res = res.replace('Yo nunca he', 'Never have I ever')
            res = res.replace('¿Quién es más probable que', 'Who is most likely to')
            res = res.replace('¿Quién de este grupo', 'Who in this group')
            res = res.replace('Verdad: ¿Alguna vez has', 'Truth: Have you ever')
            res = res.replace('Verdad: ¿Te consideras', 'Truth: Do you consider yourself')
            res = res.replace('Verdad:', 'Truth:')
            res = res.replace('Duelo: Por turnos, nombren', 'Duel: Taking turns, name')
            res = res.replace('No repitan; quien tarde más de', 'No repeats; whoever takes more than')
            res = res.replace('segundos pierde', 'seconds loses')
            res = res.replace('Reto: Nombra', 'Dare: Name')
            res = res.replace('ejemplos de', 'examples of')
            res = res.replace('en 15 segundos', 'in 15 seconds')
            res = res.replace('en 10 segundos', 'in 10 seconds')
            res = res.replace('Reto en pareja:', 'Couple Dare:' if locale == 'en-US' else 'Pair Challenge:')
            res = res.replace('Reto de tres:', 'Trio Challenge:')
            res = res.replace('Misión doble:', 'Double Mission:')
            res = res.replace('EVENTO GRUPAL: durante los próximos', 'PARTY RULE: for the next' if locale == 'en-US' else 'PUB RULE: for the next')
            res = res.replace('turnos:', 'turns:')
            res = res.replace('Nadie puede decir', 'Nobody can say')
            res = res.replace('Todos deben', 'Everyone must')
            res = res.replace('Pregunta HOT:', 'HOT Question:')
            res = res.replace('Reto HOT:', 'HOT Dare:')
            res = res.replace('Respondan por separado:', 'Answer separately:')
            res = res.replace('¿Qué plan sencillo disfrutas más con tus amigos?', 'What simple hangout do you enjoy most with your friends?' if locale == 'en-US' else 'What simple plan do you enjoy most with your mates?')
            res = res.replace('¿Qué apodo cariñoso te han puesto tus amigos?', 'What nickname have your friends given you?' if locale == 'en-US' else 'What nickname have your mates given you?')
            res = res.replace('¿Prefieres salir a comer o hacer una reunión en casa con amigos?', 'Do you prefer eating out or having a hangout at home with friends?' if locale == 'en-US' else 'Do you prefer dining out or a house gathering with your mates?')
            res = res.replace('¿Qué canción te recuerda a tu grupo de amigos?', 'What track reminds you of your crew?')
            res = res.replace('¿Qué amigo te hizo reír más recientemente?', 'Which friend made you laugh the hardest recently?' if locale == 'en-US' else 'Which mate made you laugh the hardest recently?')
            res = res.replace('¿Qué comida nunca falta en una reunión de tus amigos?', 'What food is a must-have at your squad hangouts?' if locale == 'en-US' else 'What scran is never missing when your mates meet up?')
            res = res.replace('¿Eres quien organiza los planes o quien espera la invitación?', 'Are you the planner or do you just wait for the invite?')
            res = res.replace('¿Qué actividad nueva te gustaría probar con tus amigos?', 'What new activity would you love to try with your crew?' if locale == 'en-US' else 'What new activity would you fancy trying with your mates?')
            res = res.replace('¿Qué viaje corto te gustaría hacer con tu grupo?', 'What quick getaway would you take with your squad?' if locale == 'en-US' else 'What weekend trip would you love to take with your group?')
            res = res.replace('¿Qué película volverías a ver con tus amigos?', 'What movie would you rewatch with your friends?' if locale == 'en-US' else 'What film would you rewatch with your mates?')
            res = res.replace('fingido entender un chiste para no quedar mal', 'faked understanding a joke to avoid being awkward')
            res = res.replace('enviado un mensaje al chat equivocado', 'sent a text to the wrong chat')
            res = res.replace('ensayado una conversación completa estando a solas', 'rehearsed an entire conversation while alone')
            res = res.replace('revisado el teléfono aunque sabía que no había llegado ninguna notificación', 'checked your phone even though you knew there were no notifications')
            res = res.replace('asentido como si hubiera escuchado algo que en realidad no entendí', 'nodded along as if you heard something you did not understand')
            res = res.replace('ocultado que seguía hablando con una expareja', 'hid that you were still in touch with an ex')
            res = res.replace('cancelado un plan con amigos por una cita', 'cancelled plans with friends for a date')
            res = res.replace('quemado una comida que parecía imposible de arruinar', 'burnt a meal that seemed impossible to mess up')
            
            # Limpiar signos de interrogación invertidos si empieza en inglés
            if res.startswith('¿'):
                res = res[1:]
                
            if locale == 'en-GB':
                res = res.replace('friends', 'mates').replace('hangout', 'gathering')
                
        return res
        
    # 3. Portugués (pt-BR / pt-PT)
    elif locale.startswith('pt-'):
        res = res.replace(' y [player_x]', ' e [player_x]').replace(' y [player_x1]', ' e [player_x1]')
        matched_trivia = False
        for pat, _, pt_tpl in TRIVIA_TEMPLATES:
            if re.search(pat, res):
                res = re.sub(pat, pt_tpl, res)
                res = translate_phrase(res, 'pt')
                matched_trivia = True
                break
                
        if not matched_trivia:
            res = res.replace('Yo nunca he', 'Eu nunca')
            res = res.replace('¿Quién es más probable que', 'Quem é mais provável de' if locale == 'pt-BR' else 'Quem tem mais probabilidade de')
            res = res.replace('¿Quién de este grupo', 'Quem deste grupo')
            res = res.replace('Verdad: ¿Alguna vez has', 'Verdade: Você já' if locale == 'pt-BR' else 'Verdade: Já alguma vez')
            res = res.replace('Verdad: ¿Te consideras', 'Verdade: Você se considera' if locale == 'pt-BR' else 'Verdade: Consideras-te')
            res = res.replace('Verdad:', 'Verdade:')
            res = res.replace('Duelo: Por turnos, nombren', 'Duelo: Por turnos, digam' if locale == 'pt-BR' else 'Duelo: À vez, digam')
            res = res.replace('No repitan; quien tarde más de', 'Sem repetir; quem demorar mais de')
            res = res.replace('segundos pierde', 'segundos perde')
            res = res.replace('Reto: Nombra', 'Desafio: Diga' if locale == 'pt-BR' else 'Desafio: Diz')
            res = res.replace('ejemplos de', 'exemplos de')
            res = res.replace('en 15 segundos', 'em 15 segundos')
            res = res.replace('en 10 segundos', 'em 10 segundos')
            res = res.replace('Reto en pareja:', 'Desafio em dupla:' if locale == 'pt-BR' else 'Desafio a dois:')
            res = res.replace('Reto de tres:', 'Desafio em trio:' if locale == 'pt-BR' else 'Desafio a três:')
            res = res.replace('Misión doble:', 'Missão dupla:')
            res = res.replace('EVENTO GRUPAL: durante los próximos', 'REGRA DA BALADA: durante as próximas' if locale == 'pt-BR' else 'REGRA DA NOITE: durante as próximas')
            res = res.replace('turnos:', 'rodadas:' if locale == 'pt-BR' else 'rondas:')
            res = res.replace('Nadie puede decir', 'Ninguém pode dizer')
            res = res.replace('Todos deben', 'Todos devem')
            res = res.replace('Pregunta HOT:', 'Pergunta HOT:')
            res = res.replace('Reto HOT:', 'Desafio HOT:')
            res = res.replace('Respondan por separado:', 'Respondam separadamente:' if locale == 'pt-BR' else 'Respondam em separado:')
            res = res.replace('¿Qué plan sencillo disfrutas más con tus amigos?', 'Qual rolê simples você mais curte com seus amigos?' if locale == 'pt-BR' else 'Que plano simples gostas mais de fazer com os teus amigos?')
            res = res.replace('¿Qué apodo cariñoso te han puesto tus amigos?', 'Que apelido carinhoso seus amigos já te deram?' if locale == 'pt-BR' else 'Que alcunha carinhosa te puseram os teus amigos?')
            res = res.replace('¿Prefieres salir a comer o hacer una reunión en casa con amigos?', 'Prefere sair pra comer ou fazer resenha em casa com a galera?' if locale == 'pt-BR' else 'Preferes sair para jantar ou fazer um convívio em casa com a malta?')
            res = res.replace('¿Qué canción te recuerda a tu grupo de amigos?', 'Qual música lembra o seu grupo de amigos?' if locale == 'pt-BR' else 'Que música te faz lembrar o teu grupo de amigos?')
            res = res.replace('¿Qué amigo te hizo reír más recientemente?', 'Qual amigo te fez rir mais recentemente?')
            res = res.replace('¿Qué comida nunca falta en una reunión de tus amigos?', 'Que comida nunca falta no rolê com seus amigos?' if locale == 'pt-BR' else 'Que petisco nunca falta num convívio com os teus amigos?')
            res = res.replace('¿Eres quien organiza los planes o quien espera la invitación?', 'Você organiza os rolês ou fica esperando o convite?' if locale == 'pt-BR' else 'És quem combina os planos ou quem fica à espera do convite?')
            res = res.replace('¿Qué actividad nueva te gustaría probar con tus amigos?', 'Que atividade nova gostaria de tentar com seus amigos?' if locale == 'pt-BR' else 'Que atividade nova gostarias de experimentar com os teus amigos?')
            res = res.replace('¿Qué viaje corto te gustaría hacer con tu grupo?', 'Que viagem rápida você gostaria de fazer com a galera?' if locale == 'pt-BR' else 'Que escapadinha gostarias de fazer com o teu grupo?')
            res = res.replace('¿Qué película volverías a ver con tus amigos?', 'Que filme você assistiria de novo com seus amigos?' if locale == 'pt-BR' else 'Que filme voltarias a ver com os teus amigos?')
            res = res.replace('fingido entender un chiste para no quedar mal', 'fingiu entender uma piada para não pagar mico' if locale == 'pt-BR' else 'fingiu entender uma anedota para não ficar mal')
            res = res.replace('enviado un mensaje al chat equivocado', 'mandou mensagem para o chat errado')
            res = res.replace('ensayado una conversación completa estando a solas', 'ensaiou uma conversa inteira estando sozinho')
            res = res.replace('revisado el teléfono aunque sabía que no había llegado ninguna notificación', 'olhou o celular mesmo sabendo que não tinha notificação' if locale == 'pt-BR' else 'olhou para o telemóvel mesmo sabendo que não tinha notificações')
            res = res.replace('asentido como si hubiera escuchado algo que en realidad no entendí', 'concordou como se tivesse ouvido algo que na verdade não entendeu')
            res = res.replace('ocultado que seguía hablando con una expareja', 'escondeu que ainda falava com um ex')
            res = res.replace('cancelado un plan con amigos por una cita', 'desmarcou rolê com amigos por causa de um date' if locale == 'pt-BR' else 'desmarcou com amigos por causa de um encontro')
            res = res.replace('quemado una comida que parecía imposible de arruinar', 'queimou uma comida que parecia impossível de estragar')
            
            if res.startswith('¿'):
                res = res[1:]
                
        return res
        
    return res

def localize_resp(resp, locale):
    if not resp or locale.startswith('es-'):
        return resp
    EN_RESP = {
        'Buenos Aires': 'Buenos Aires',
        'Marte': 'Mars',
        'Francia': 'France',
        '6 lados': '6 sides',
        'Río Sena': 'Seine River',
        'Aristóteles': 'Aristotle',
        '1453': '1453',
        '1919': '1919',
        'Kurt Gödel': 'Kurt Gödel',
        'Océano Pacífico': 'Pacific Ocean',
        'Mercurio': 'Mercury',
        'Leonardo da Vinci': 'Leonardo da Vinci',
        'Tokio': 'Tokyo',
        'Rusia': 'Russia',
        'Vaticano': 'Vatican City',
        'Everest': 'Mount Everest',
        'Amazonas': 'Amazon River',
        'Nilo': 'Nile River',
        'Cervantes': 'Miguel de Cervantes',
        'Shakespeare': 'William Shakespeare',
        'Colón': 'Christopher Columbus',
        '1492': '1492',
        '1969': '1969',
        '1945': '1945',
        '1989': '1989',
        '1789': '1789',
        'Oxígeno': 'Oxygen',
        'Hidrógeno': 'Hydrogen',
        'Hierro': 'Iron',
        'Oro': 'Gold',
        'Plata': 'Silver',
        'Cobre': 'Copper',
        'Helio': 'Helium',
        'Carbono': 'Carbon',
        'Nitrógeno': 'Nitrogen'
    }
    PT_RESP = {
        'Buenos Aires': 'Buenos Aires',
        'Marte': 'Marte',
        'Francia': 'França',
        '6 lados': '6 lados',
        'Río Sena': 'Rio Sena',
        'Aristóteles': 'Aristóteles',
        '1453': '1453',
        '1919': '1919',
        'Kurt Gödel': 'Kurt Gödel',
        'Océano Pacífico': 'Oceano Pacífico',
        'Mercurio': 'Mercúrio',
        'Leonardo da Vinci': 'Leonardo da Vinci',
        'Tokio': 'Tóquio',
        'Rusia': 'Rússia',
        'Vaticano': 'Vaticano',
        'Everest': 'Monte Evereste',
        'Amazonas': 'Rio Amazonas',
        'Nilo': 'Rio Nilo',
        'Cervantes': 'Miguel de Cervantes',
        'Shakespeare': 'William Shakespeare',
        'Colón': 'Cristóvão Colombo',
        '1492': '1492',
        '1969': '1969',
        '1945': '1945',
        '1989': '1989',
        '1789': '1789',
        'Oxígeno': 'Oxigénio' if locale == 'pt-PT' else 'Oxigênio',
        'Hidrógeno': 'Hidrogénio' if locale == 'pt-PT' else 'Hidrogênio',
        'Hierro': 'Ferro',
        'Oro': 'Ouro',
        'Plata': 'Prata',
        'Cobre': 'Cobre',
        'Helio': 'Hélio',
        'Carbono': 'Carbono',
        'Nitrógeno': 'Azoto' if locale == 'pt-PT' else 'Nitrogênio'
    }
    if locale in ('en-US', 'en-GB'):
        return EN_RESP.get(resp, resp)
    elif locale in ('pt-BR', 'pt-PT'):
        return PT_RESP.get(resp, resp)
    return resp

def localize_regla(regla, locale):
    if not regla:
        return regla
    if locale in ('en-US', 'en-GB'):
        return regla.replace('Prohibido:', 'Forbidden:').replace('sí', 'yes').replace('no', 'no')
    elif locale in ('pt-BR', 'pt-PT'):
        return regla.replace('Prohibido:', 'Proibido:').replace('sí', 'sim').replace('no', 'não')
    return regla

def compile_locale(locale):
    print(f"\n--- Compilando {locale} ---")
    loc_dir = os.path.join(LOCALES_DIR, locale)
    os.makedirs(loc_dir, exist_ok=True)
    
    total_cards = 0
    exported_vars = []
    
    for type_name, file_slug, var_name in CARD_TYPES_CONFIG:
        src_file = os.path.join(ES_CO_DIR, f"{file_slug}.es-CO.js")
        with open(src_file, 'r', encoding='utf-8') as f:
            c = f.read()
        s = c.find('[')
        e = c.rfind(']') + 1
        source_cards = json.loads(c[s:e])
        
        localized_cards = []
        for card in source_cards:
            item = dict(card)
            # Localizar texto
            item['texto'] = localize_text(card.get('texto', ''), locale, type_name)
            # Localizar castigo
            if 'castigo' in card:
                item['castigo'] = adapt_castigo(card['castigo'], locale)
            # Localizar resp
            if 'resp' in card:
                item['resp'] = localize_resp(card['resp'], locale)
            # Localizar regla
            if 'regla' in card:
                item['regla'] = localize_regla(card['regla'], locale)
                
            localized_cards.append(item)
            
        out_filename = f"{file_slug}.{locale}.js"
        out_path = os.path.join(loc_dir, out_filename)
        
        file_content = f"/**\n * Oh My Shot! — Previa Mix ({locale})\n * Tipo: {type_name}\n * Cantidad: {len(localized_cards)} cartas\n */\n\n"
        file_content += f"export const {var_name} = " + json.dumps(localized_cards, indent=2, ensure_ascii=False) + ";\n\n"
        file_content += f"export default {var_name};\n"
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
            
        total_cards += len(localized_cards)
        exported_vars.append((file_slug, var_name))
        
    print(f"[{locale}] 9 archivos generados con éxito ({total_cards} cartas)")
    
    # Generar previa-mix.<locale>.js agregador
    aggregator_path = os.path.join(LOCALES_DIR, f"previa-mix.{locale}.js")
    agg_code = f"/**\n * Oh My Shot! — Previa Mix ({locale})\n * Archivo agregador modular por tipo de carta.\n */\n\n"
    for slug, var_n in exported_vars:
        agg_code += f"import {{ {var_n} }} from './{locale}/{slug}.{locale}.js';\n"
        
    agg_code += f"\nexport const locale = \"{locale}\";\n\n"
    agg_code += "export const questions = [\n"
    for _, var_n in exported_vars:
        agg_code += f"  ...{var_n},\n"
    agg_code = agg_code.rstrip(',\n') + "\n];\n\n"
    agg_code += f"export {{ castigos_toma, castigos_notoma }} from './castigos.{locale}.js';\n\n"
    agg_code += "export default questions;\n"
    
    with open(aggregator_path, 'w', encoding='utf-8') as f:
        f.write(agg_code)
    print(f"[{locale}] Agregador previa-mix.{locale}.js generado.")

def main():
    target_locales = ['es-MX', 'es-ES', 'en-US', 'en-GB', 'pt-BR', 'pt-PT']
    for loc in target_locales:
        compile_locale(loc)
    print("\n¡Todos los 6 idiomas compilados y divididos con éxito!")

if __name__ == '__main__':
    main()
