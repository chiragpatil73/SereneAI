from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

NORMAL = "normal"
ELEVATED = "elevated"
EMERGENCY = "emergency"
RISK_ORDER = {NORMAL: 0, ELEVATED: 1, EMERGENCY: 2}

CATEGORY_PRIORITY = {"self_harm": 4, "medical": 3, "third_party": 2, "distress": 1, "session_context": 0}


@dataclass(frozen=True)
class SafetyResult:
    risk_level: str
    triggered: bool
    category: Optional[str]
    rule_id: Optional[str] = None

    def public(self) -> dict:
        return {"risk_level": self.risk_level, "triggered": self.triggered, "category": self.category}


SAFE = SafetyResult(NORMAL, False, None)


@dataclass(frozen=True)
class Rule:
    id: str
    category: str
    grade: str
    pattern: re.Pattern
    negatable: bool = False


def _r(rule_id: str, category: str, grade: str, pattern: str, negatable: bool = False) -> Rule:
    return Rule(rule_id, category, grade, re.compile(pattern), negatable)


_NOT_PREVENTION = r"(?!\s+(?:prevention|awareness|hotline|helpline|statistics|rates|research|month|squad))"

RULES: list[Rule] = [
    _r("sh_kill_myself", "self_harm", "em", r"\bkill(?:ing)? myself\b", True),
    _r("sh_end_life", "self_harm", "em", r"\bend(?:ing)? my (?:own )?life\b", True),
    _r("sh_take_life", "self_harm", "em", r"\btak(?:e|ing) my (?:own )?life\b", True),
    _r("sh_commit_suicide", "self_harm", "em", r"\bcommit(?:ting)? suicide\b", True),
    _r("sh_suicidal", "self_harm", "em", r"\bsuicidal\b", True),
    _r(
        "sh_suicide_thoughts",
        "self_harm",
        "em",
        r"\b(?:thoughts?|thinking|ideas?|urges?|feelings?) (?:of|about|on) (?:suicide|killing myself|ending (?:it|my life|it all))\b"
        + _NOT_PREVENTION,
        True,
    ),
    _r(
        "sh_hurt_intent",
        "self_harm",
        "em",
        r"\b(?:want|wanted|going|plan|planning|plans|thinking|think about|urge|need|feel like|tempted|about|ready|have to|decided)\b[^.]{0,25}?\b(?:hurt|harm|injure|cut|punish)(?:ing)? myself\b",
        True,
    ),
    _r(
        "sh_selfharm_intent",
        "self_harm",
        "em",
        r"\b(?:want|going|plan|planning|about|urge|need|feel like|thinking of|tempted)\b[^.]{0,20}?\bself ?harm\b",
        True,
    ),
    _r("sh_end_it_all", "self_harm", "em", r"\bend it all\b", True),
    _r(
        "sh_dont_want_live",
        "self_harm",
        "em",
        r"\b(?:don't|do not) want to (?:live|be alive|exist|go on living|wake up)(?: anymore| any more| any longer| tomorrow)?\b",
    ),
    _r("sh_want_die", "self_harm", "em", r"\b(?:want|wanted|ready|need) to die\b", True),
    _r("sh_wish_dead", "self_harm", "em", r"\bwish (?:i|that i) (?:was|were) (?:dead|never born|gone)\b", True),
    _r("sh_better_dead", "self_harm", "em", r"\b(?:better off dead|rather be dead|rather die)\b", True),
    _r(
        "sh_no_reason_live",
        "self_harm",
        "em",
        r"\b(?:no (?:reason|point) (?:to|in) (?:live|living|go on|going on|be alive)|life (?:is|isn't|is not) (?:not )?worth living)\b",
    ),
    _r(
        "sh_note",
        "self_harm",
        "em",
        r"\b(?:writing|wrote|written|leaving|left|made|making|drafted) (?:a |my )?(?:suicide|goodbye|final) (?:note|letter|message)\b",
    ),
    _r("sh_selfharm_mention", "self_harm", "el", r"\bself ?harm(?:ing|ed)?\b", True),
    _r("sh_hurt_mention", "self_harm", "el", r"\b(?:hurt|harm|injure|cut)(?:ting|ing)? myself\b", True),
    _r("sh_kms", "self_harm", "el", r"\bkms\b"),
    _r(
        "tp_self_harm",
        "third_party",
        "el",
        r"\b(?:kill|hurt|harm)(?:s|ing)? (?:himself|herself|themselves|themself)\b|\bwants? to (?:die|end (?:it all|their life|his life|her life))\b",
    ),
    _r(
        "med_cant_breathe",
        "medical",
        "em",
        r"\b(?:can't|cannot|can not|unable to|not able to) breathe\b|\bstruggling to breathe\b|\bgasping for (?:air|breath)\b|\b(?:stopped|not) breathing\b",
    ),
    _r("med_choking", "medical", "em", r"\b(?:i am|i'm) choking\b|\bthroat (?:is )?(?:closing|swelling)(?: up| shut)?\b|\bface (?:is )?swelling\b"),
    _r(
        "med_chest_pain",
        "medical",
        "em",
        r"\bchest pains?\b|\bpain in my chest\b|\bcrushing (?:pain|pressure|weight)\b|\bchest pressure\b|\bpressure (?:in|on) my chest\b",
    ),
    _r(
        "med_faint",
        "medical",
        "em",
        r"\b(?:passing|passed|pass) out\b|\bfaint(?:ing|ed)\b|\b(?:feel|feeling) faint\b|\bblack(?:ing|ed) out\b|\b(?:loss of|lost|losing) consciousness\b|\bunconscious\b|\bunresponsive\b|\bcollapsed\b",
    ),
    _r(
        "med_bleeding",
        "medical",
        "em",
        r"\bbleeding (?:a lot|heavily|badly|profusely|non ?stop|won't stop|will not stop)\b|\b(?:won't|can't|cannot) stop (?:the )?bleeding\b|\bsevere bleeding\b|\bheavy bleeding\b|\blots? of blood\b|\blosing (?:a lot of|so much) blood\b|\bblood everywhere\b",
    ),
    _r(
        "med_injury",
        "medical",
        "em",
        r"\b(?:broke|broken|fractured|dislocated|snapped) (?:my |a |the )?(?:leg|arm|neck|back|spine|skull|hip|ribs?|jaw|femur|bones?)\b|\b(?:serious(?:ly)?|severe(?:ly)?) (?:injur(?:y|ed)|hurt|wounded)\b|\bhead injury\b|\bdeep (?:cut|wound|gash)\b|\b(?:i was|i got|i've been|i have been) (?:just )?(?:stabbed|shot)\b|\bcan't (?:move|feel) my (?:legs?|arms?|feet|hands?)\b|\bbone (?:is )?(?:sticking|poking)\b",
    ),
    _r(
        "med_stroke_attack",
        "medical",
        "em",
        r"\bhaving a (?:stroke|heart attack|seizure)\b|\bface (?:is )?droop(?:ing|s)\b|\bslurr(?:ing|ed) (?:my )?speech\b|\bsudden(?:ly)? (?:can't|cannot) (?:speak|see)\b",
    ),
    _r(
        "med_overdose",
        "medical",
        "em",
        r"\boverdos(?:e|ed|ing)\b|\b(?:took|taken|swallowed|swallowing|taking|ate|drank) (?:too many|a lot of|way too much|a whole bottle of|an entire bottle of|all my|all the)\b[^.]{0,25}?\b(?:pills?|tablets?|meds|medication|medicine|painkillers)\b",
    ),
    _r("med_anaphylaxis", "medical", "em", r"\banaphyla\w*\b|\bsevere allergic reaction\b"),
    _r(
        "med_breath_trouble",
        "medical",
        "el",
        r"\b(?:trouble|difficulty|hard to|harder to) breath(?:e|ing)\b|\bshort(?:ness)? of breath\b|\bcan't catch my breath\b|\bcannot catch my breath\b|\bbreathless\b|\bcouldn't breathe\b",
    ),
    _r("med_chest_tight", "medical", "el", r"\bchest (?:tightness|feels tight|is tight)\b|\btight(?:ness)? in my chest\b|\bmy chest (?:is |feels )?tight\b"),
    _r("med_dizzy", "medical", "el", r"\b(?:dizzy|dizziness|light ?headed|room is spinning)\b"),
    _r("med_head_hit", "medical", "el", r"\bhit my head\b|\bbanged my head\b"),
    _r(
        "ds_cant_handle",
        "distress",
        "el",
        r"\b(?:can't|cannot|can not) (?:handle|cope with|deal with|take|do) (?:everything|it all|all of (?:it|this)|any of this|this anymore|it anymore|this any more|any more of this|anything)\b",
    ),
    _r("ds_cant_go_on", "distress", "el", r"\bcan't (?:go on|carry on|keep going|do this anymore|do this any more)\b"),
    _r("ds_give_up", "distress", "el", r"\bgive up on (?:everything|life|myself)\b|\bgiving up on (?:everything|life|myself)\b"),
    _r("ds_hopeless", "distress", "el", r"\b(?:hopeless|helpless|worthless)\b|\b(?:no|lost all) hope\b|\bno way out\b"),
    _r(
        "ds_burden",
        "distress",
        "el",
        r"\b(?:i'm|i am) (?:a )?burden\b|\bburden (?:to|on) (?:everyone|others|my family|everybody)\b|\b(?:nobody|no one) (?:would|will) (?:care|miss me|notice)\b|\b(?:better off|be better) without me\b|\bno one cares\b",
    ),
    _r("ds_not_here", "distress", "el", r"\bdon't want to be here anymore\b"),
    _r("ds_going_to_die", "distress", "el", r"\bi(?:'m| am) (?:going|about) to die\b"),
    _r("ds_panic", "distress", "el", r"\bpanic attack\b"),
]


_IDIOMS = re.compile(
    r"\b(?:die|dying|dead) (?:of|from|for) (?:embarrassment|laughter|boredom|shame|cringe|hunger|thirst|curiosity)\b"
    r"|\bkill(?:ing)? myself (?:laughing|with laughter)\b|\bdying to\b|\bdead tired\b|\bdead serious\b"
)

_SLANG = [
    (r"\bcant\b", "can't"),
    (r"\bdont\b", "don't"),
    (r"\bwont\b", "won't"),
    (r"\bwouldnt\b", "wouldn't"),
    (r"\bcouldnt\b", "couldn't"),
    (r"\bim\b", "i'm"),
    (r"\bive\b", "i've"),
    (r"\bwanna\b", "want to"),
    (r"\bgonna\b", "going to"),
    (r"\bgotta\b", "have to"),
    (r"\bcannot\b", "can not"),
]

_THIRD_PERSON = re.compile(
    r"\b(?:my (?:friends?|mom|mother|dad|father|brother|sister|son|daughter|husband|wife|partner|boyfriend|girlfriend|colleague|coworker|classmate|roommate|cousin|neighbou?r|grandmother|grandfather|grandma|grandpa|uncle|aunt|dog|cat|pet|student|patient|teacher)"
    r"|he|she|they|someone|somebody|a friend|a person|people|the (?:patient|character|man|woman|girl|boy|guy))\b"
)
_FIRST_PERSON = re.compile(r"\b(?:i|i'm|i've|i'd|i'll|me|myself|my own)\b")
_NEG_TAIL = re.compile(
    r"\b(?:not|never|no|don't|do not|won't|wouldn't|would not|no longer|no intention of|not going to)\s+"
    r"(?:(?:want|going|planning|plan|about|trying|try|ever|actually|really|intend|thinking|feeling|feel|having|have)\s+(?:to\s+|of\s+|any\s+)?){0,3}$"
)
_PAST_MARKER = re.compile(
    r"\b(?:yesterday|last (?:night|week|month|year|time)|days? ago|weeks? ago|months? ago|years? ago|a while ago|previously|in the past|when i was|used to|earlier this week)\b"
)
_PAST_VERB_TAIL = re.compile(
    r"\b(?:had|got|felt|was|were|experienced|suffered|used to have|used to get)\s+(?:a |an |some |the |very |really |severe |sharp |bad |terrible |crushing |intense |strong |such )*$"
)
_INFORMATIONAL = re.compile(r"^(?:what|why|how|when|which|is|are|does|do|can|could|should)(?![\w'])")
_PRESENT_MARKER = re.compile(
    r"\b(?:right now|now|currently|at the moment|still|just|as we speak|this (?:moment|minute)|tonight|seconds? ago|minutes? ago|is happening|am having|i'm having)\b"
)


def _normalize(sentence: str) -> str:
    t = sentence.lower().replace("\u2019", "'").replace("\u2018", "'").replace("`", "'")
    t = re.sub(r"[-_]", " ", t)
    t = re.sub(r"[^a-z0-9'\s]", " ", t)
    for pat, repl in _SLANG:
        t = re.sub(pat, repl, t)
    t = _IDIOMS.sub(" ", t)
    return re.sub(r"\s+", " ", t).strip()


def _third_person(sentence: str, start: int) -> bool:
    window = sentence[max(0, start - 70) : start]
    last = None
    for m in _THIRD_PERSON.finditer(window):
        last = m
    if last is None:
        return False
    return _FIRST_PERSON.search(window[last.end() :]) is None


def _negated(sentence: str, start: int) -> bool:
    return bool(_NEG_TAIL.search(sentence[:start].rstrip() + " "))


def _past(sentence: str, start: int, end: int) -> bool:
    if _PRESENT_MARKER.search(sentence):
        return False
    if _PAST_VERB_TAIL.search(sentence[:start]):
        return True
    near = sentence[max(0, start - 20) : start] + " " + sentence[end : end + 25]
    return bool(_PAST_MARKER.search(near))


def _decide(rule: Rule, sentence: str, m: re.Match) -> tuple[str, Optional[str]]:
    third = _third_person(sentence, m.start())

    if rule.category == "third_party":
        return ELEVATED, "third_party"

    if rule.category == "self_harm":
        if third:
            return ELEVATED, "third_party"
        if rule.grade == "el" or (rule.negatable and _negated(sentence, m.start())):
            return ELEVATED, "self_harm"
        return EMERGENCY, "self_harm"

    if rule.category == "medical":
        past = _past(sentence, m.start(), m.end())
        if third:
            if rule.grade == "em" and not past:
                return ELEVATED, "third_party"
            return NORMAL, None
        if rule.grade == "el":
            return ELEVATED, "medical"
        if past:
            return ELEVATED, "medical"
        return EMERGENCY, "medical"

    if third:
        return NORMAL, None
    return ELEVATED, "distress"


def evaluate(text: str, floor: str = NORMAL) -> SafetyResult:
    best: SafetyResult = SAFE
    for raw_sentence in re.split(r"[.!?;\n]+", text or ""):
        sentence = _normalize(raw_sentence)
        if not sentence:
            continue
        informational = bool(_INFORMATIONAL.match(sentence)) and not _FIRST_PERSON.search(sentence)
        for rule in RULES:
            if informational and rule.category == "medical":
                continue
            for m in rule.pattern.finditer(sentence):
                level, category = _decide(rule, sentence, m)
                if level == NORMAL:
                    continue
                candidate = SafetyResult(level, True, category, rule.id)
                if _better(candidate, best):
                    best = candidate

    if RISK_ORDER[floor] > RISK_ORDER[best.risk_level]:
        return SafetyResult(floor, True, "session_context", "session_floor")
    return best


def _better(candidate: SafetyResult, current: SafetyResult) -> bool:
    if RISK_ORDER[candidate.risk_level] != RISK_ORDER[current.risk_level]:
        return RISK_ORDER[candidate.risk_level] > RISK_ORDER[current.risk_level]
    return CATEGORY_PRIORITY.get(candidate.category or "", 0) > CATEGORY_PRIORITY.get(current.category or "", 0)
