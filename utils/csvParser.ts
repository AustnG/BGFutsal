
// Robust CSV parser that handles quoted fields and commas within fields.
export function parseCsvData<T extends Record<string, any>>(csvText: string): T[] {
  // Normalize line endings and split into lines
  const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

  if (lines.length < 1) {
    console.warn("CSV parsing issue: No lines in CSV text.");
    return [];
  }

  // Parse a single CSV line, respecting quotes
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let start = 0;
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        let value = text.substring(start, i).trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"'); // Handle escaped quotes
        }
        result.push(value);
        start = i + 1;
      }
    }
    
    // Push the last field
    let lastValue = text.substring(start).trim();
    if (lastValue.startsWith('"') && lastValue.endsWith('"')) {
      lastValue = lastValue.slice(1, -1).replace(/""/g, '"');
    }
    result.push(lastValue);
    
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.trim());

  if (headers.length === 0 || headers.every(h => h === '')) {
      console.warn("CSV parsing issue: Headers are empty.");
      return [];
  }
  
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const entry: any = {};

    headers.forEach((header, index) => {
      if (header === '') return;
      
      // Ensure we don't access out of bounds, default to empty string
      const val = index < values.length ? values[index] : '';
      entry[header] = val;
    });
    
    data.push(entry as T);
  }

  return data;
}
