from __future__ import annotations

import random
from typing import Optional

ACKNOWLEDGEMENTS: dict[str, list[str]] = {
    "calm": [
        "It's good to hear that you're feeling calm. That's worth noticing.",
        "It sounds like you're in a steady place right now, and I'm glad.",
        "Feeling calm is something to appreciate, so let's make the most of this moment.",
        "That sounds peaceful. It can help to notice what is contributing to it.",
        "I'm glad things feel settled for you right now.",
    ],
    "neutral": [
        "Thanks for checking in.",
        "Okay, thanks for letting me know where you're at.",
        "It's fine to be somewhere in the middle. Not every check-in needs a big feeling.",
        "Good to hear from you.",
        "That's a useful place to start.",
    ],
    "stressed": [
        "It sounds like today has been stressful.",
        "That sounds like a lot of pressure to carry.",
        "Feeling stretched thin like that is tiring.",
        "It makes sense that you feel stressed with so much going on.",
        "Stress can build up quietly, and it sounds like it has been building.",
    ],
    "anxious": [
        "It sounds like your mind is working overtime with worry.",
        "Anxious feelings can be really uncomfortable, and you don't have to push them away.",
        "I hear that things feel uneasy right now.",
        "That sounds like a lot of worry to hold.",
        "Thank you for telling me. Anxiety can make everything feel urgent.",
    ],
    "overwhelmed": [
        "It sounds like things feel overwhelming right now.",
        "That sounds like too much all at once.",
        "When everything piles up, it's hard to know where to look first.",
        "Feeling overwhelmed is a sign that you've been carrying a lot.",
        "It makes sense that this feels like a lot. Let's slow it down together.",
    ],
    "sad": [
        "I'm sorry it's feeling heavy today.",
        "That sounds like a hard, low kind of day.",
        "Thank you for sharing that. Feeling low is okay, and you don't have to hide it here.",
        "It sounds like you're carrying something heavy right now.",
        "I'm here with you. Low moods can make everything feel slower.",
    ],
    "frustrated": [
        "That sounds really frustrating, and your reaction makes sense.",
        "That sounds irritating, and it's fair to feel that way.",
        "I can hear how much this is wearing on you.",
        "Frustration can build fast when things keep going wrong.",
        "It makes sense to be annoyed. Let's give that energy somewhere to settle.",
    ],
}

HIGH_STRESS_NOTES = [
    "You don't have to fix anything right now.",
    "One small step at a time is enough.",
    "Let's keep this simple and gentle.",
]

INVITATIONS: dict[str, list[str]] = {
    "paced_breathing": [
        "A few minutes of slow, paced breathing can help your body ease out of stress mode. Want to try it? In for 4, hold for 4, out for 6.",
        "Let's give your body a short reset. Breathe in gently for 4, then let a long breath out for 6. I can guide you through Paced Breathing.",
        "Try one slow breath with me: in through your nose for 4, and a long, quiet exhale for 6. Shall we do a few rounds?",
    ],
    "five_four_three_two_one": [
        "Let's focus on the present moment. Try naming five things you can see around you.",
        "Let's bring things down to the size of this moment. Look around and name five things you can see.",
        "You don't have to solve everything now. Start by naming five things you can see, and I'll guide you through 5-4-3-2-1 Grounding.",
    ],
    "sensory_grounding": [
        "Let's pause for a moment. Press your feet into the floor and notice three things you can touch.",
        "A short sensory reset can help. Notice something you can hear, something you can feel, and something you can see.",
        "Try this: slow down, feel the surface under your hands, and name what you notice. Want me to guide a Sensory Grounding exercise?",
    ],
    "positive_reflection": [
        "If you feel up to it, a gentle reflection might help. Think of one small thing, however minor, that felt okay today.",
        "Would you like to try a short, gentle reflection? Reaching out to someone you trust, even with a quick message, can help too.",
        "When you're ready, we can look for one small thing that is okay right now. There's no pressure to feel differently.",
    ],
    "gentle_movement": [
        "Some gentle movement can help release built-up tension. Try rolling your shoulders back and stretching your neck slowly.",
        "Your body may be holding on to this. A few easy stretches can help. Want me to walk you through Gentle Movement?",
    ],
    "guided_check_in": [
        "How has your day been so far? A sentence or two is plenty.",
        "What has been on your mind today?",
        "Is there anything, big or small, that's taking up space in your head right now?",
        "How is your body feeling at the moment: tense, tired, or okay?",
    ],
}

CALM_CLOSERS = [
    "Would you like to spend a couple of minutes reflecting on what's helping you feel this way?",
    "If you'd like, a short reflection can make this calm easier to come back to later.",
]

ELEVATED_MESSAGES: dict[str, str] = {
    "distress": (
        "Thank you for telling me. It sounds like this feels like more than you can carry right now, "
        "and that matters. You don't have to face it alone. Talking to someone you trust, or a support "
        "line, can really help. If you'd like, we can also slow things down together with a short exercise."
    ),
    "medical": (
        "Those physical sensations can be frightening. I can't tell what is causing them and I can't "
        "diagnose anything. If they are severe, getting worse, or don't ease, please seek medical care. "
        "If it feels okay, we can try slow breathing together while you decide."
    ),
    "self_harm": (
        "Thank you for being open with me about that. Thoughts like these deserve real support from a "
        "person. If they ever feel stronger or more urgent, please contact emergency services or someone "
        "you trust right away. I'm still here, and we can go slowly."
    ),
    "third_party": (
        "It sounds like you're worried about someone else. If they may be in immediate danger, please "
        "contact emergency services right away. If it's not urgent, staying with them and helping them "
        "reach a trusted person or professional is a good step. I'm happy to help you steady yourself too."
    ),
    "session_context": (
        "I'm going to keep things gentle and simple. Support from a real person is still the best next "
        "step, and I'm here for whatever small step feels manageable right now."
    ),
}

EMERGENCY_TITLE = "Immediate Help May Be Needed"
EMERGENCY_BODY = (
    "Your message suggests that you may be experiencing a serious or potentially dangerous situation. "
    "SereneAI cannot diagnose or treat emergencies. Please seek immediate human or medical assistance."
)
EMERGENCY_MEDICAL_NOTICE = (
    "If you are experiencing severe physical symptoms, loss of consciousness, severe breathing difficulty, "
    "severe chest pain, serious injury, or another potentially dangerous condition, seek urgent medical attention."
)
EMERGENCY_DISCLAIMER = "SereneAI is not a replacement for professional medical care or emergency services."
EMERGENCY_CATEGORY_LINES = {
    "self_harm": "You matter, and you deserve support right now. Please reach out to emergency services or someone you trust. You don't have to go through this alone.",
    "medical": "Please don't wait to see whether this passes. Call emergency services or get to medical care now.",
}
EMERGENCY_TRANSCRIPT_TEXT = EMERGENCY_TITLE + ". " + EMERGENCY_BODY


def emergency_payload(category: Optional[str], emergency_info: dict) -> dict:
    return {
        "title": EMERGENCY_TITLE,
        "body": EMERGENCY_BODY,
        "category_line": EMERGENCY_CATEGORY_LINES.get(category or "", EMERGENCY_CATEGORY_LINES["self_harm"]),
        "medical_notice": EMERGENCY_MEDICAL_NOTICE,
        "disclaimer": EMERGENCY_DISCLAIMER,
        "category": category,
        "services": emergency_info,
    }


def feedback_reply(
    action: str, feedback: str, recommendation: Optional[dict], rng: Optional[random.Random] = None
) -> str:
    rng = rng or random
    title = recommendation["title"] if recommendation else None
    if action == "offer_continue_or_finish":
        opener = rng.choice(["I'm glad that helped.", "That's good to hear.", "Thank you for letting me know."])
        return f"{opener} Would you like to continue or finish your check-in?"
    if action == "offer_complement":
        base = "Thanks for telling me. A little relief still counts."
        if title:
            return f"{base} We could add another short exercise, {title}, or you can finish here."
        return f"{base} You can finish here, or just talk for a bit."
    if action == "try_different":
        base = "Let's try a different grounding approach."
        return f"{base} I'd suggest {title}: {recommendation['description']}" if title else base
    if action == "suggest_human_support":
        return (
            "Thanks for trying. Not every exercise works every time, and that's okay. It might help to "
            "pause the exercises and reach out to someone you trust, or a support line, especially if things still feel heavy."
        )
    base = "That's completely okay. You can stop at any time."
    if title:
        return f"{base} If you'd like, we can try something lighter: {title} ({recommendation['duration_minutes']} min). Or we can simply talk."
    return f"{base} We can simply talk, or you can finish here."


def generate(
    emotion: str,
    stress_level: str,
    risk_level: str,
    category: Optional[str],
    intervention_id: Optional[str],
    recent_replies: Optional[list[str]] = None,
    rng: Optional[random.Random] = None,
) -> str:
    rng = rng or random
    recent = set(recent_replies or [])

    for _ in range(8):
        parts: list[str] = []
        if risk_level == "elevated":
            parts.append(ELEVATED_MESSAGES.get(category or "distress", ELEVATED_MESSAGES["distress"]))
            if intervention_id and category in {"distress", "medical", "session_context", "third_party"}:
                if category != "third_party":
                    parts.append(rng.choice(INVITATIONS.get(intervention_id, [""])))
        else:
            parts.append(rng.choice(ACKNOWLEDGEMENTS.get(emotion, ACKNOWLEDGEMENTS["neutral"])))
            if stress_level == "High" and emotion not in {"calm", "neutral"} and rng.random() < 0.7:
                parts.append(rng.choice(HIGH_STRESS_NOTES))
            if emotion == "calm" and intervention_id == "positive_reflection":
                parts.append(rng.choice(CALM_CLOSERS))
            elif intervention_id:
                parts.append(rng.choice(INVITATIONS.get(intervention_id, INVITATIONS["guided_check_in"])))
        message = " ".join(p for p in parts if p).strip()
        if message not in recent:
            return message
    return message
