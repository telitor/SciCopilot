import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";

export const PAPER_ANALYSIS_TIMEOUT_MESSAGE =
  "论文解析超时，请尝试上传更短的 PDF，或稍后重试。";
export const AGENT_RESPONSE_TIMEOUT_MESSAGE =
  "智能体响应超时，请稍后重试。首次调用可能需要 1-2 分钟。";

// ==================== Axios Instance ====================
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 30000,
});

export function getErrorMessage(
  error: unknown,
  timeoutMessage = AGENT_RESPONSE_TIMEOUT_MESSAGE,
): string {
  if (axios.isAxiosError(error)) {
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message.toLowerCase().includes("timeout")
    ) {
      return timeoutMessage;
    }

    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail.toLowerCase().includes("timeout") ? timeoutMessage : detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return JSON.stringify(item);
        })
        .join("; ");
    }

    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }

    const message = error.response?.data?.message;
    if (message) {
      return typeof message === "string" ? message : JSON.stringify(message);
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return "未知错误";
}

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - only handle global authentication failures.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== API Service Functions ====================

// ---- Auth ----
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  register: (email: string, password: string, username?: string) =>
    apiClient.post("/auth/register", { email, password, username }),

  getCurrentUser: () => apiClient.get("/users/me"),

  // TODO: Connect to backend
  logout: () => Promise.resolve(),
};

// ---- Agents ----
export const agentAPI = {
  getAgents: () => apiClient.get("/agents"),
};

// ---- Papers ----
export const paperAPI = {
  analyzePaper: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/papers/analyze", formData, {
      timeout: 180000,
    });
  },

  upload: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/papers/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
        }
      },
    });
  },

  getPapers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/papers", { params }),

  getPaper: (id: string) => apiClient.get(`/papers/${id}`),

  getDeepRead: (id: string) => apiClient.get(`/papers/${id}/deep-read`),

  deletePaper: (id: string) => apiClient.delete(`/papers/${id}`),

  // TODO: Implement WebSocket connection for streaming
  connectPaperChat: (paperId: string) => {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/papers/${paperId}/chat`;
    return new WebSocket(wsUrl);
  },
};

// ---- Research ----
export const researchAPI = {
  decompose: (direction: string) =>
    apiClient.post("/research/decompose", { direction }),

  getResearchTree: (id: string) => apiClient.get(`/research/${id}`),
};

// ---- Experiment ----
export const experimentAPI = {
  generateRoadmap: (questionId: string) =>
    apiClient.post("/experiments/generate-roadmap", {
      question_id: questionId,
    }),

  getRoadmap: (id: string) => apiClient.get(`/experiments/${id}`),
};

// ---- Code Reproduction ----
export const codeAPI = {
  analyzeRepo: (repoUrl: string) =>
    apiClient.post("/code/analyze-repo", { repo_url: repoUrl }),

  getRepoAnalysis: (id: string) => apiClient.get(`/code/${id}`),

  diagnoseError: (errorLog: string, repoId: string) =>
    apiClient.post("/code/diagnose", { error_log: errorLog, repo_id: repoId }),
};

// ---- Result Analysis ----
export const resultAPI = {
  analyze: (file: File, config?: Record<string, unknown>) => {
    const formData = new FormData();
    formData.append("file", file);
    if (config) formData.append("config", JSON.stringify(config));
    return apiClient.post("/results/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAnalysis: (id: string) => apiClient.get(`/results/${id}`),
};

// ---- Knowledge Graph ----
export const kgAPI = {
  getGraph: (params?: { query?: string; nodeId?: string; limit?: number }) =>
    apiClient.get("/kg/explore", { params }),

  searchNodes: (query: string) =>
    apiClient.get("/kg/search", { params: { q: query } }),
};

// ---- Conversations ----
export const conversationAPI = {
  getConversations: () => apiClient.get("/conversations"),

  createConversation: (data: { agent_id: string; title?: string }) =>
    apiClient.post("/conversations", data),

  getMessages: (conversationId: string) =>
    apiClient.get(`/conversations/${conversationId}/messages`),

  chat: (data: {
    conversation_id: string;
    agent_id: string;
    message: string;
  }) => apiClient.post("/chat", data, { timeout: 120000 }),
};

export default apiClient;
