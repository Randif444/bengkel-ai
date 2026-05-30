/**
 * Storage Utility
 * Manages local storage operations for configuration and service history.
 */

const generateSafeId = () => {
  // Use native crypto if available (HTTPS/localhost), otherwise fallback to timestamp-based ID
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  return (
    "servis-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 9)
  );
};

export const getConfig = () => {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem("bengkelai_config");
  if (data) return JSON.parse(data);

  const defaultConfig = {
    nama_bengkel: "BengkelAI",
    alamat: "",
    no_wa_bengkel: "",
  };

  localStorage.setItem("bengkelai_config", JSON.stringify(defaultConfig));
  return defaultConfig;
};

export const saveConfig = (configData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bengkelai_config", JSON.stringify(configData));
};

export const getServices = () => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("bengkelai_servis");
  return data ? JSON.parse(data) : [];
};

export const getServiceById = (id) => {
  const services = getServices();
  return services.find((s) => s.id === id) || null;
};

export const saveService = (serviceData) => {
  if (typeof window === "undefined") return null;

  const services = getServices();
  const newService = {
    ...serviceData,
    id: generateSafeId(),
    tanggal: new Date().toISOString(),
    status: serviceData.status || "proses",
  };

  services.push(newService);
  localStorage.setItem("bengkelai_servis", JSON.stringify(services));
  return newService;
};

export const updateService = (id, updatedData) => {
  if (typeof window === "undefined") return;

  const services = getServices();
  const index = services.findIndex((s) => s.id === id);

  if (index !== -1) {
    services[index] = { ...services[index], ...updatedData };
    localStorage.setItem("bengkelai_servis", JSON.stringify(services));
    return services[index];
  }
  return null;
};

export const deleteService = (id) => {
  if (typeof window === "undefined") return false;

  const services = getServices();
  const filteredServices = services.filter((s) => s.id !== id);

  if (services.length !== filteredServices.length) {
    localStorage.setItem("bengkelai_servis", JSON.stringify(filteredServices));
    return true;
  }
  return false;
};
