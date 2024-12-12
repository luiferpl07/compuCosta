export const getData = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener datos" + response?.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
