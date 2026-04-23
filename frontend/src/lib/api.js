import axios from "axios";

// Use env override when provided; otherwise default to deployed backend.
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://temp-d50y.onrender.com";

export const API = `${BACKEND_URL}/api`;

const client = axios.create({
  baseURL: API,
  // Render can cold-start; keep timeout higher than 20s.
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- CHAT ----------
export async function sendChat(payload) {
  try {
    const { data } = await client.post("/chat", payload);
    return data;
  } catch (error) {
    if (error?.code === "ECONNABORTED") {
      throw new Error(
        `Chat request timed out. Backend may be cold-starting. Retry in a few seconds. URL: ${BACKEND_URL}`
      );
    }
    console.error("Chat API Error:", error?.response || error.message);
    throw error;
  }
}

// ---------- WEATHER ----------
export async function getWeather(city, language = "en") {
  try {
    const { data } = await client.get("/weather", {
      params: { city, language },
    });
    return data;
  } catch (error) {
    console.error("Weather API Error:", error?.response || error.message);
    throw error;
  }
}

// ---------- MARKET ----------
export async function getMarket(language = "en") {
  try {
    const { data } = await client.get("/market/prices", {
      params: { language },
    });
    return data;
  } catch (error) {
    console.error("Market API Error:", error?.response || error.message);
    throw error;
  }
}

// ---------- FEED ----------
export async function calculateFeed(payload) {
  try {
    const { data } = await client.post("/feed/calculate", payload);
    return data;
  } catch (error) {
    console.error("Feed API Error:", error?.response || error.message);
    throw error;
  }
}

// ---------- DIAGNOSIS ----------
export async function diagnose(symptoms, language = "en") {
  try {
    const { data } = await client.post("/diagnosis", {
      symptoms,
      language,
    });
    return data;
  } catch (error) {
    console.error("Diagnosis API Error:", error?.response || error.message);
    throw error;
  }
}

// ---------- FAQ ----------
export async function listFaq(language = "en") {
  try {
    const { data } = await client.get("/faq", {
      params: { language },
    });
    return data;
  } catch (error) {
    console.error("FAQ API Error:", error?.response || error.message);
    throw error;
  }
}
