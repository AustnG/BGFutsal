
export async function fetchSheetData(sheetUrl: string): Promise<string> {
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText} for URL: ${sheetUrl}`);
    }
    const csvData = await response.text();
    return csvData;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error; // Re-throw to be caught by calling component
  }
}
