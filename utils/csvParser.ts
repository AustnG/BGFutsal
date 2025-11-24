
// Simple CSV parser, assumes comma delimiter and that first row is headers.
// For more robust parsing, a library like PapaParse would be better.
export function parseCsvData<T extends Record<string, any>>(csvText: string): T[] {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 1) { // Needs at least a header row
    console.warn("CSV parsing issue: No lines in CSV text or only empty lines.");
    return [];
  }

  const headers = lines[0].split(',').map(header => header.trim());
  // Check for valid headers (e.g., not all empty)
  if (headers.length === 0 || headers.every(h => h === '')) {
      console.warn("CSV parsing issue: Headers are empty or invalid.");
      return [];
  }
  
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) { // Start from 1 for data rows
    const values = lines[i].split(','); // Raw values for this row
    const entry = {} as T;

    headers.forEach((header, index) => {
      if (header === '') { // Skip empty headers effectively
          // console.warn(`Skipping empty header at index ${index} in line ${i+1}`);
          return; 
      }
      if (index < values.length && values[index] !== undefined) {
        (entry as any)[header] = values[index].trim();
      } else {
        // Value is missing for this header in this row (row is shorter than headers, or value is truly undefined)
        (entry as any)[header] = ''; // Default to empty string to ensure property exists and is a string
      }
    });
    data.push(entry);
  }
  return data;
}
