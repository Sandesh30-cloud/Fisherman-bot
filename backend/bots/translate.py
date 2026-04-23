"""Multi-language response snippets for EN / HI / MR."""
from __future__ import annotations

SUPPORTED = {"en", "hi", "mr"}


def normalize_lang(lang: str | None) -> str:
    if not lang:
        return "en"
    lang = lang.lower().strip()
    return lang if lang in SUPPORTED else "en"


T = {
    "greeting": {
        "en": "Namaste! I am Matsya, your fisherman assistant. How can I help you today?",
        "hi": "नमस्ते! मैं मत्स्य हूँ, आपका मछली पालन सहायक। मैं आपकी किस प्रकार मदद कर सकता हूँ?",
        "mr": "नमस्कार! मी मत्स्य आहे, तुमचा मासेपालन सहाय्यक. मी तुमची कशी मदत करू शकतो?",
    },
    "ask_location": {
        "en": "Please share your city or district so I can fetch live weather.",
        "hi": "कृपया अपना शहर या जिला बताइए ताकि मैं सही मौसम बता सकूँ।",
        "mr": "कृपया तुमचे शहर किंवा जिल्हा सांगा, म्हणजे मी अचूक हवामान देऊ शकेन.",
    },
    "city_not_found": {
        "en": "I could not find that city. Please try a nearby major town.",
        "hi": "मुझे यह शहर नहीं मिला। कृपया पास के किसी बड़े शहर का नाम दीजिए।",
        "mr": "हे शहर सापडले नाही. जवळच्या मोठ्या शहराचे नाव सांगा.",
    },
    "heavy_rain": {
        "en": "Heavy rain expected. Reduce feeding by 30–50% and check pond overflow.",
        "hi": "भारी बारिश की संभावना है। खिलाना 30–50% कम करें और तालाब का ओवरफ़्लो जाँचें।",
        "mr": "जोरदार पाऊस अपेक्षित आहे. खाद्य 30–50% कमी करा आणि तलावाची पातळी तपासा.",
    },
    "no_rain": {
        "en": "Clear skies. Normal feeding schedule is fine.",
        "hi": "मौसम साफ है। सामान्य खिलाना ठीक है।",
        "mr": "हवामान स्वच्छ आहे. नियमित खाद्य देणे ठीक आहे.",
    },
    "feed_ready": {
        "en": "Daily feed recommendation calculated below.",
        "hi": "आपके तालाब के लिए दैनिक खाद्य सलाह नीचे दी गई है।",
        "mr": "तुमच्या तलावासाठी दैनिक खाद्य शिफारस खाली दिली आहे.",
    },
    "market_today": {
        "en": "Today's mandi fish prices (₹/kg):",
        "hi": "आज के मंडी में मछली के भाव (₹/किलो):",
        "mr": "आजचे बाजारभाव मासे (₹/किलो):",
    },
    "sell_now": {
        "en": "Price is high — good time to sell.",
        "hi": "भाव अच्छा है — बेचने का सही समय है।",
        "mr": "दर चांगला आहे — विकण्याची योग्य वेळ.",
    },
    "hold": {
        "en": "Prices are average. You may wait a few days.",
        "hi": "भाव सामान्य हैं। कुछ दिन रुक सकते हैं।",
        "mr": "दर सामान्य आहेत. काही दिवस थांबू शकता.",
    },
    "diagnosis_intro": {
        "en": "Based on the symptoms, here is my best assessment:",
        "hi": "लक्षणों के आधार पर मेरा आकलन यह है:",
        "mr": "लक्षणांच्या आधारे माझे मूल्यांकन खालीलप्रमाणे:",
    },
    "diagnosis_unknown": {
        "en": "Symptoms unclear. Please describe: surface gasping, spots, appetite, fin damage, etc.",
        "hi": "लक्षण स्पष्ट नहीं हैं। कृपया बताएं: सतह पर आना, धब्बे, भूख, पंख, आदि।",
        "mr": "लक्षणे स्पष्ट नाहीत. कृपया सांगा: पृष्ठभागावर येणे, ठिपके, भूक, पंख, इ.",
    },
    "faq_intro": {
        "en": "Here is what I know about that:",
        "hi": "इस विषय पर मुझे यह पता है:",
        "mr": "याबद्दल मला हे माहीत आहे:",
    },
    "fallback": {
        "en": "I can help with weather, feed, market prices, disease diagnosis, and general FAQs. Try a quick action below.",
        "hi": "मैं मौसम, खाद्य, मंडी भाव, बीमारी निदान और सामान्य प्रश्नों में मदद कर सकता हूँ। नीचे दिए बटन आज़माएँ।",
        "mr": "मी हवामान, खाद्य, बाजारभाव, रोग निदान आणि सामान्य प्रश्नांमध्ये मदत करू शकतो. खालील बटणे वापरा.",
    },
}


def t(key: str, lang: str) -> str:
    lang = normalize_lang(lang)
    return T.get(key, {}).get(lang) or T.get(key, {}).get("en") or key
