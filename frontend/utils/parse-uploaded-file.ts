/**
 * File parsing utility for CSV, JSON, and Excel (.xlsx/.xls)
 */
export const parseUploadedFile = async (file: File): Promise<any> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // --- CSV Parser ---
  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return resolve({ headers: [], rows: [] });
        
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length === 0) return resolve({ headers: [], rows: [] });
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || '';
          });
          return obj;
        });
        resolve({ headers, rows, totalRows: rows.length, fileType: 'csv' });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // --- JSON Parser ---
  if (ext === 'json') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          const rows = Array.isArray(data) ? data : [data];
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          resolve({ headers, rows, totalRows: rows.length, fileType: 'json' });
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // --- Excel Parser (.xlsx / .xls) ---
  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // @ts-ignore - XLSX is loaded via CDN in layout.tsx
          const XLSX = (window as any).XLSX;
          if (!XLSX) {
            return reject(new Error('Excel parser (SheetJS) not loaded. Please refresh the page.'));
          }
          const binary = e.target?.result;
          const workbook = XLSX.read(binary, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          resolve({ headers, rows, totalRows: rows.length, fileType: 'xlsx' });
        } catch (err) {
          reject(new Error('Could not parse Excel file'));
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  throw new Error(`Unsupported file type: .${ext}. Use CSV, Excel, or JSON.`);
};
