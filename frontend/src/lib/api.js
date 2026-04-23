// import axios from "axios";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// export const API = `${BACKEND_URL}/api`;

// const client = axios.create({
//   baseURL: API,
//   timeout: 20000,
// });

// export async function sendChat(payload) {
//   const { data } = await client.post("/chat", payload);
//   return data;
// }

// export async function getWeather(city, language = "en") {
//   const { data } = await client.get("/weather", { params: { city, language } });
//   return data;
// }

// export async function getMarket(language = "en") {
//   const { data } = await client.get("/market/prices", { params: { language } });
//   return data;
// }

// export async function calculateFeed(payload) {
//   const { data } = await client.post("/feed/calculate", payload);
//   return data;
// }

// export async function diagnose(symptoms, language = "en") {
//   const { data } = await client.post("/diagnosis", { symptoms, language });
//   return data;
// }

// export async function listFaq(language = "en") {
//   const { data } = await client.get("/faq", { params: { language } });
//   return data;
// }

// export function fetchYourEndpoint() {
//   return fetch(`${API}/your-endpoint`)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log(data);
//       return data;
//     });
// }












import axios from "axios";

// Fallback for safety (prevents undefined issues in production)
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://temp-d50y.onrender.com";

export const API = `${BACKEND_URL}/api`;

// Debug (remove later if needed)
console.log("Backend URL:", BACKEND_URL);
console.log("API Base URL:", API);

const client = axios.create({
  baseURL: API,
  timeout: 20000,
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
