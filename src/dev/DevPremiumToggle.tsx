import React, { useEffect, useState } from "react";
import { isPremium, enablePremium, disablePremium } from "../store/premium";

const DevPremiumToggle: React.FC = () => {
  // ❌ Ne s'affiche PAS en production
  if (import.meta.env.PROD) return null;

  const [premium, setPremium] = useState<boolean>(false);

  useEffect(() => {
    setPremium(isPremium());
  }, []);

  const togglePremium = () => {
    if (premium) {
      disablePremium();
      console.log("🔓 Premium désactivé");
    } else {
      enablePremium();
      console.log("💎 Premium activé");
    }

    const newValue = !premium;
    setPremium(newValue);
  };

  return (
    <div style={containerStyle}>
      <span>
        💎 Premium:{" "}
        <strong style={{ color: premium ? "#4ade80" : "#f87171" }}>
          {premium ? "ON" : "OFF"}
        </strong>
      </span>

      <button onClick={togglePremium} style={buttonStyle}>
        Toggle
      </button>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "10px",
  right: "10px",
  background: "rgba(0,0,0,0.8)",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "12px",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
};

const buttonStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  background: "#7c3aed",
  color: "#fff",
};

export default DevPremiumToggle;