"""FAQ knowledge base bot."""
from __future__ import annotations

from typing import Any

from .translate import t

FAQ_ITEMS = [
    {
        "id": "pond_ph",
        "q": "What is the ideal pond pH for fish farming?",
        "keywords": ["ph", "acidity", "alkalinity"],
        "a": {
            "en": "Ideal pond pH for most freshwater fish (Rohu, Catla, Tilapia) is 6.5–8.5. Test weekly; apply agricultural lime if below 6.5.",
            "hi": "अधिकांश मीठे पानी की मछलियों (रोहू, कतला, तिलापिया) के लिए आदर्श pH 6.5–8.5 है। साप्ताहिक जाँच करें; 6.5 से कम हो तो कृषि चूना डालें।",
            "mr": "बहुतांश गोड्या पाण्यातील माशांसाठी (रोहू, कटला, तिलापिया) आदर्श pH 6.5–8.5 आहे. आठवड्याला तपासा; 6.5 पेक्षा कमी असेल तर चुना टाका.",
        },
    },
    {
        "id": "stocking_density",
        "q": "How many fingerlings per acre?",
        "keywords": ["stocking", "density", "fingerling", "per acre"],
        "a": {
            "en": "Typical polyculture stocking: 4,000–6,000 fingerlings/acre (Rohu + Catla + Mrigal in 3:4:3 ratio). Reduce density if aeration is limited.",
            "hi": "सामान्य मिश्रित पालन: 4,000–6,000 फिंगरलिंग/एकड़ (रोहू + कतला + मृगल 3:4:3 अनुपात)। एयरेशन सीमित हो तो घनत्व कम रखें।",
            "mr": "सामान्य मिश्र मत्स्यपालन: 4,000–6,000 फिंगरलिंग/एकर (रोहू + कटला + मृगळ 3:4:3). वायुविजन मर्यादित असल्यास घनता कमी ठेवा.",
        },
    },
    {
        "id": "harvest_time",
        "q": "When to harvest Rohu?",
        "keywords": ["harvest", "sell time", "rohu harvest"],
        "a": {
            "en": "Rohu is typically harvested at 800 g–1.2 kg, usually 10–12 months after stocking fingerlings (~25 g). Market demand peaks before festivals.",
            "hi": "रोहू को आमतौर पर 800 ग्राम से 1.2 किलो पर पकड़ा जाता है, फिंगरलिंग (~25 ग्राम) के 10–12 महीने बाद। त्यौहारों से पहले माँग अधिक रहती है।",
            "mr": "रोहू सामान्यतः 800 ग्राम–1.2 किलो वजनावर पकडली जाते, फिंगरलिंग (~25 ग्राम) नंतर 10–12 महिन्यांनी. सणांपूर्वी मागणी जास्त असते.",
        },
    },
    {
        "id": "oxygen_low",
        "q": "Why do fish come to the surface in the morning?",
        "keywords": ["surface", "morning", "gasping"],
        "a": {
            "en": "Surface gasping in the morning indicates low dissolved oxygen. Start aerators, reduce feeding, and do 20–30% water exchange.",
            "hi": "सुबह सतह पर आना कम ऑक्सीजन का संकेत है। एयरेटर चलाएँ, खिलाना कम करें और 20–30% पानी बदलें।",
            "mr": "सकाळी पृष्ठभागावर येणे म्हणजे कमी ऑक्सिजन. एरेटर सुरू करा, खाद्य कमी करा आणि 20–30% पाणी बदला.",
        },
    },
    {
        "id": "water_color",
        "q": "What does green pond water mean?",
        "keywords": ["green water", "color", "algae"],
        "a": {
            "en": "Green water = phytoplankton bloom. Moderate bloom (Secchi 30–45 cm) is healthy. Heavy bloom risks night-time oxygen crash — reduce feed and monitor.",
            "hi": "हरा पानी = फाइटोप्लैंकटन ब्लूम। मध्यम ब्लूम (सेक्की 30–45 सेमी) अच्छा है। भारी ब्लूम रात को ऑक्सीजन घटा सकता है — खाद्य कम करें।",
            "mr": "हिरवे पाणी = फायटोप्लॅंक्टन ब्लूम. मध्यम ब्लूम (सेक्की 30–45 सेमी) चांगले. जास्त ब्लूम रात्री ऑक्सिजन कमी करू शकतो — खाद्य कमी करा.",
        },
    },
    {
        "id": "lime_use",
        "q": "When to apply lime to pond?",
        "keywords": ["lime", "liming", "pond preparation"],
        "a": {
            "en": "Apply agricultural lime during pond preparation at 200–300 kg/ha (acidic soils) and quarterly top-up 50–100 kg/ha to maintain alkalinity.",
            "hi": "तालाब तैयारी के समय कृषि चूना 200–300 किग्रा/हेक्टेयर (अम्लीय मिट्टी) और हर तिमाही 50–100 किग्रा/हेक्टेयर डालें।",
            "mr": "तलाव तयारीच्या वेळी कृषी चुना 200–300 किग्रॅ/हेक्टर (आम्ल मातीत) आणि तिमाहीत 50–100 किग्रॅ/हेक्टर टाका.",
        },
    },
    {
        "id": "feed_frequency",
        "q": "How often should I feed fish?",
        "keywords": ["feed frequency", "how often", "meal"],
        "a": {
            "en": "Feed 2–3 times daily during warm weather. Skip feeding on heavy-rain or very cold days (<15 °C). Always feed at fixed times.",
            "hi": "गर्म मौसम में दिन में 2–3 बार खिलाएँ। भारी बारिश या ठंडे दिन (<15°C) में न खिलाएँ। समय निश्चित रखें।",
            "mr": "उष्ण हवामानात दिवसातून 2–3 वेळा खाद्य द्या. जोरदार पाऊस किंवा थंड दिवसात (<15°C) खाद्य देऊ नका. वेळ निश्चित ठेवा.",
        },
    },
]


def find_faq(text: str, language: str = "en") -> dict[str, Any]:
    lowered = (text or "").lower()
    matched = []
    for item in FAQ_ITEMS:
        if any(kw in lowered for kw in item["keywords"]):
            matched.append(item)

    if not matched:
        return {
            "ok": True,
            "intro": t("fallback", language),
            "items": [
                {"id": it["id"], "q": it["q"], "a": it["a"].get(language, it["a"]["en"])}
                for it in FAQ_ITEMS[:5]
            ],
            "is_list": True,
        }

    return {
        "ok": True,
        "intro": t("faq_intro", language),
        "items": [
            {"id": it["id"], "q": it["q"], "a": it["a"].get(language, it["a"]["en"])}
            for it in matched[:3]
        ],
        "is_list": False,
    }


def list_all_faq(language: str = "en") -> list[dict[str, Any]]:
    return [
        {"id": it["id"], "q": it["q"], "a": it["a"].get(language, it["a"]["en"])}
        for it in FAQ_ITEMS
    ]
