from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline

from ..config import BASE_DIR, settings
from .preprocessing import preprocess

MODEL_FILE = "emotion_model.pkl"
VECTORIZER_FILE = "vectorizer.pkl"
SEED = 42


def make_vectorizer() -> TfidfVectorizer:
    return TfidfVectorizer(
        preprocessor=preprocess,
        tokenizer=str.split,
        token_pattern=None,
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
    )


def make_model() -> LogisticRegression:
    return LogisticRegression(C=8.0, max_iter=2000, class_weight="balanced", random_state=SEED)


def load_dataset(path: Path) -> tuple[list[str], list[str]]:
    texts: list[str] = []
    labels: list[str] = []
    seen: set[str] = set()
    with Path(path).open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            text = (row.get("text") or "").strip()
            label = (row.get("emotion") or "").strip().lower()
            if not text or not label or text.lower() in seen:
                continue
            seen.add(text.lower())
            texts.append(text)
            labels.append(label)
    return texts, labels


def train(
    dataset_path: Path | None = None,
    model_dir: Path | None = None,
    test_size: float = 0.25,
    write_docs: bool = False,
    quiet: bool = False,
) -> dict:
    dataset_path = Path(dataset_path or settings.dataset_path)
    model_dir = Path(model_dir or settings.model_dir)
    model_dir.mkdir(parents=True, exist_ok=True)

    texts, labels = load_dataset(dataset_path)
    classes = sorted(set(labels))

    x_train, x_test, y_train, y_test = train_test_split(
        texts, labels, test_size=test_size, stratify=labels, random_state=SEED
    )
    vec = make_vectorizer()
    model = make_model().fit(vec.fit_transform(x_train), y_train)
    y_pred = model.predict(vec.transform(x_test))
    report = classification_report(y_test, y_pred, labels=classes, output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    cv_scores = cross_val_score(make_pipeline(make_vectorizer(), make_model()), texts, labels, cv=cv)

    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dataset_rows": len(texts),
        "classes": classes,
        "class_counts": {c: labels.count(c) for c in classes},
        "test_size": test_size,
        "test_rows": len(x_test),
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "macro_precision": round(report["macro avg"]["precision"], 4),
        "macro_recall": round(report["macro avg"]["recall"], 4),
        "macro_f1": round(report["macro avg"]["f1-score"], 4),
        "per_class": {
            c: {k: round(report[c][k], 4) for k in ("precision", "recall", "f1-score")} | {"support": int(report[c]["support"])}
            for c in classes
        },
        "confusion_matrix": {"labels": classes, "matrix": matrix},
        "cv_accuracy_mean": round(float(np.mean(cv_scores)), 4),
        "cv_accuracy_std": round(float(np.std(cv_scores)), 4),
        "final_model_fit_on": "all dataset rows (after evaluation)",
        "disclaimer": "Proof-of-concept classifier trained on a small demonstration dataset. Not clinically validated.",
    }

    final_vec = make_vectorizer()
    final_model = make_model().fit(final_vec.fit_transform(texts), labels)
    joblib.dump(final_model, model_dir / MODEL_FILE)
    joblib.dump(final_vec, model_dir / VECTORIZER_FILE)
    (model_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    if write_docs:
        write_evaluation_doc(metrics, BASE_DIR.parent.parent / "docs" / "MODEL_EVALUATION.md")

    if not quiet:
        print(f"Trained on {len(texts)} rows ({len(x_test)} held out for testing)")
        print(f"Hold-out accuracy : {metrics['accuracy']:.3f}")
        print(f"Macro P / R / F1  : {metrics['macro_precision']:.3f} / {metrics['macro_recall']:.3f} / {metrics['macro_f1']:.3f}")
        print(f"5-fold CV accuracy: {metrics['cv_accuracy_mean']:.3f} +/- {metrics['cv_accuracy_std']:.3f}")
        print(f"Saved model to {model_dir}")
    return metrics


def write_evaluation_doc(m: dict, path: Path) -> None:
    labels = m["confusion_matrix"]["labels"]
    rows = "\n".join(
        f"| {c} | {v['precision']:.2f} | {v['recall']:.2f} | {v['f1-score']:.2f} | {v['support']} |"
        for c, v in m["per_class"].items()
    )
    header = "| actual \\ predicted | " + " | ".join(labels) + " |\n|---|" + "---|" * len(labels)
    matrix = "\n".join(
        f"| **{lab}** | " + " | ".join(str(n) for n in row) + " |"
        for lab, row in zip(labels, m["confusion_matrix"]["matrix"])
    )
    doc = f"""# Emotion classifier: evaluation

> **The model is a proof-of-concept classifier trained on a small demonstration dataset and is not
> clinically validated.** The numbers below describe how well it separates the seven labels in *this
> demonstration data*. They are not evidence of clinical accuracy and must not be presented as such.

Generated by `python -m app.ml.train` on {m['trained_at']}.

## Setup
- Data: `dataset/emotion_training.csv` ({m['dataset_rows']} unique sentences, written by hand for the demo)
- Split: {int((1 - m['test_size']) * 100)}% train / {int(m['test_size'] * 100)}% test, stratified, seed 42 ({m['test_rows']} test rows)
- Features: NLTK-stemmed tokens, TF-IDF (1-2 grams, sublinear tf)
- Model: Logistic Regression (`C=8`, balanced class weights)
- The saved model is refit on all rows *after* this evaluation.

## Results on the held-out test set
| Metric | Value |
|---|---|
| Accuracy | {m['accuracy']:.3f} |
| Macro precision | {m['macro_precision']:.3f} |
| Macro recall | {m['macro_recall']:.3f} |
| Macro F1 | {m['macro_f1']:.3f} |
| 5-fold CV accuracy | {m['cv_accuracy_mean']:.3f} ± {m['cv_accuracy_std']:.3f} |

### Per-class
| Emotion | Precision | Recall | F1 | Support |
|---|---|---|---|---|
{rows}

### Confusion matrix (test set)
{header}
{matrix}

## Limitations
- Tiny, hand-written, English-only dataset written by the developer; sentences are short and stereotyped.
- Real users write differently (slang, mixed emotions, sarcasm, other languages). Expect much lower accuracy in the wild.
- Labels are broad *emotional states*, not diagnoses. "Stressed", "anxious" and "overwhelmed" overlap heavily.
- Mixed statements follow one rule: an explicitly named feeling decides the label.
- No demographic or clinical validation of any kind. Safety decisions do **not** rely on this model.
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(doc, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the SereneAI emotion classifier")
    parser.add_argument("--dataset", type=Path, default=None)
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument("--write-docs", action="store_true", help="also regenerate docs/MODEL_EVALUATION.md")
    args = parser.parse_args()
    train(args.dataset, args.out, write_docs=args.write_docs)


if __name__ == "__main__":
    main()
