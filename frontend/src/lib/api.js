import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({
  baseURL: API,
  timeout: 20000,
});

export async function sendChat(payload) {
  const { data } = await client.post("/chat", payload);
  return data;
}

export async function getWeather(city, language = "en") {
  const { data } = await client.get("/weather", { params: { city, language } });
  return data;
}

export async function getMarket(language = "en") {
  const { data } = await client.get("/market/prices", { params: { language } });
  return data;
}

export async function calculateFeed(payload) {
  const { data } = await client.post("/feed/calculate", payload);
  return data;
}

export async function diagnose(symptoms, language = "en") {
  const { data } = await client.post("/diagnosis", { symptoms, language });
  return data;
}

export async function listFaq(language = "en") {
  const { data } = await client.get("/faq", { params: { language } });
  return data;
}
