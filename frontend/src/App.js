import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import { LanguageProvider } from "./lib/LanguageContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </LanguageProvider>
  );
}

export default App;
