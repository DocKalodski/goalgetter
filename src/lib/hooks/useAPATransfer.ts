import { useEffect } from "react";

export function useAPATransfer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const apaData = localStorage.getItem("apa_transfer_data");
    if (apaData) {
      try {
        const data = JSON.parse(apaData);
        console.log("📥 APA Transfer Data:", data);

        // Store it for GG components to use
        localStorage.setItem("apa_goal_data", JSON.stringify(data));

        // Clear the transfer key after reading
        localStorage.removeItem("apa_transfer_data");
      } catch (e) {
        console.error("Failed to parse APA transfer data:", e);
      }
    }
  }, []);
}

export function getAPAGoalData() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("apa_goal_data");
  return data ? JSON.parse(data) : null;
}
