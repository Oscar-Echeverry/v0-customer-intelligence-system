const API_BASE_URL = "/api/v1"

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new ApiError(`API request failed: ${response.statusText}`, response.status)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof Error) {
        throw new ApiError(error.message, 500)
      }
      throw new ApiError("An unknown error occurred", 500)
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Specific methods for our application
  async predictLeadQuality(lead: any) {
    return this.post<{ quality_label: string; quality_score: number }>("/predict/lead-quality", lead)
  }

  async saveLead(lead: any) {
    return this.post("/leads", lead)
  }

  async getLeads() {
    return this.get<any[]>("/leads")
  }

  async getChurnRisk() {
    return this.get<any[]>("/churn/at-risk")
  }

  async getInsights() {
    return this.get<any>("/insights/summary")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
