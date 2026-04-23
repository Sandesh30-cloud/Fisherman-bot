"""
Intent classifier for the Fisherman Assistant Bot.
Keyword-based routing across English, Hindi (हिन्दी), and Marathi (मराठी).
"""
from __future__ import annotations

# Each intent maps to a list of keyword strings. Matching is case-insensitive
# and substring-based so morphological variants are caught.
INTENT_KEYWORDS = {
    "weather": [
        # English
        "weather", "rain", "temperature", "storm", "wind", "forecast",
        "monsoon", "climate", "humidity",
        # Hindi
        "mausam", "मौसम", "बारिश", "बारीश", "तापमान", "तूफान",
        # Marathi
        "hawaman", "हवामान", "पाऊस", "पाउस", "तापमान",
    ],
    "market": [
        # English
        "price", "market", "sell", "rate", "mandi", "selling", "buy", "today",
        "cost", "sale",
        # Hindi
        "kimat", "kimat", "कीमत", "दाम", "बाजार", "मंडी", "भाव",
        # Marathi
        "kimmat", "किंमत", "बाजारभाव", "बाजार", "दर",
    ],
    "feed": [
        # English
        "feed", "feeding", "food", "ration", "diet", "calculate",
        # Hindi
        "khana", "खाना", "दाना", "चारा", "आहार",
        # Marathi
        "khadya", "खाद्य", "खाणे", "आहार",
    ],
    "diagnosis": [
        # English
        "problem", "disease", "sick", "ill", "dying", "symptom", "spots",
        "gasping", "infection", "parasite", "surface", "lethargic", "ulcer",
        "fin rot", "white spot", "red spot", "fish issue", "fish sick",
        "fungus", "dropsy", "bloated", "gill",
        # Hindi
        "samasya", "समस्या", "रोग", "बीमार", "बीमारी", "मर", "इलाज",
        "सतह पर", "धब्बे", "लाल धब्बे", "सफेद धब्बे", "फफूंद", "खुजली",
        "सूजा", "फोड़ा", "पंख सड़", "नहीं खा", "सुस्त",
        # Marathi
        "आजार", "रोग", "मरण", "उपचार", "समस्या", "पृष्ठभाग",
        "ठिपके", "लाल ठिपके", "पांढरे ठिपके", "बुरशी", "फुगीर",
        "फोड", "पंख कुज", "खात नाही", "थकले",
    ],
    "faq": [
        # English
        "help", "how", "what", "why", "when", "faq", "guide", "info",
        "about", "tips", "advice",
        # Hindi
        "कैसे", "क्या", "क्यों", "मदद", "जानकारी",
        # Marathi
        "कसे", "काय", "का", "मदत", "माहिती",
    ],
}


def classify_intent(text: str) -> str:
    """Return the matched intent key, defaulting to 'faq'."""
    if not text:
        return "faq"
    lowered = text.lower().strip()

    # Score each intent by number of keyword hits; pick highest.
    scores: dict[str, int] = {k: 0 for k in INTENT_KEYWORDS}
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in lowered:
                scores[intent] += 1

    # Priority order for ties (most actionable first).
    priority = ["diagnosis", "weather", "market", "feed", "faq"]
    best_intent = max(
        priority,
        key=lambda i: (scores[i], -priority.index(i)),
    )
    if scores[best_intent] == 0:
        return "faq"
    return best_intent
