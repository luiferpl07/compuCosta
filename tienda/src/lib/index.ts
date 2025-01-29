export const getData = async (endpoint: string) => {
  try {
    console.log('Fetching from endpoint:', endpoint);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error en getData:', error);
    throw error;
  }
};