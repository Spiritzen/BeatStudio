export const isPremium = (): boolean => {
  return localStorage.getItem("premium") === "true";
};

export const enablePremium = () => {
  localStorage.setItem("premium", "true");
};

export const disablePremium = () => {
  localStorage.setItem("premium", "false");
};