from __future__ import annotations

import re

try:
    from nltk.stem import PorterStemmer

    _stemmer = PorterStemmer()
except Exception:
    _stemmer = None

_CONTRACTIONS = [
    (r"\bcan't\b", "can not"),
    (r"\bcannot\b", "can not"),
    (r"\bwon't\b", "will not"),
    (r"n't\b", " not"),
    (r"'m\b", " am"),
    (r"'re\b", " are"),
    (r"'ve\b", " have"),
    (r"'ll\b", " will"),
    (r"'d\b", " would"),
]

STOPWORDS = frozenset(
    """a an the and or but of to in on at for with is am are was were be been it its this that these
    those my me i you we they he she them as by from if then than there here what who whom which
    would will have has had do does did""".split()
)

_TOKEN = re.compile(r"[a-z]+")


def tokenize(text: str) -> list[str]:
    text = (text or "").lower().replace("\u2019", "'")
    for pattern, repl in _CONTRACTIONS:
        text = re.sub(pattern, repl, text)
    tokens = [t for t in _TOKEN.findall(text) if t not in STOPWORDS]
    if _stemmer is not None:
        tokens = [_stemmer.stem(t) for t in tokens]
    return tokens


def preprocess(text: str) -> str:
    return " ".join(tokenize(text))
