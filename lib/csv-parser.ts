export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split("\n")
  if (lines.length === 0) return []

  const headers = lines[0].split(",").map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    return row
  })
}

export async function loadCSV(path: string): Promise<Record<string, string>[]> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load CSV from ${path}: ${response.statusText}`)
  }
  const text = await response.text()
  return parseCSV(text)
}
