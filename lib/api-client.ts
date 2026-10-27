// Lexora API Client for Frontend-Backend Integration

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Regulation {
  id: string;
  code: string;
  title: string;
  category: string;
  year: number;
  description: string;
  sourceUrl?: string;
  status: string;
  publishedAt?: string;
  _count?: { articles: number };
  articles?: Array<{
    id: string;
    chapter?: string;
    articleNumber: string;
    title?: string;
    content: string;
  }>;
  reviewer?: { name: string };
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  incidentTypeId?: string;
  status: string;
  _count?: { items: number };
  incidentType?: { name: string };
  items?: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
    articleId?: string;
    docTemplateId?: string;
    completed?: boolean;
    article?: {
      articleNumber: string;
      title?: string;
      regulation?: { code: string; title: string };
    };
    docTemplate?: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

export interface DocTemplateField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'number';
  required?: boolean;
  placeholder?: string;
}

export interface DocTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  formSchema?: {
    fields: DocTemplateField[];
  };
  contentTemplate?: string;
  reviewer?: { name: string };
}

export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  content: string;
  durationMinutes: number;
  _count?: { quizzes: number };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetAudience: string;
  status: string;
  createdAt?: string;
  _count?: { lessons: number };
  lessons?: CourseLesson[];
}

export interface Incident {
  id: string;
  incidentTypeId: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'TRIAGED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
  impactedCount?: number;
  reportedAt?: string;
  deadlineAt?: string;
  createdAt: string;
  incidentType?: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    defaultDeadlineHours?: number;
    recommendedChecklists?: Array<{ id: string; title: string }>;
  };
  events?: Array<{
    id: string;
    title: string;
    description?: string;
    eventType: string;
    occurredAt: string;
  }>;
  reminders?: Array<{
    id: string;
    reminderType: string;
    scheduledAt: string;
    isSent: boolean;
    message: string;
  }>;
}

export interface AnalyticsSummary {
  users?: { total: number; active30d: number };
  chat?: { answeredQuestions: number };
  checklists?: { completed: number };
  documents?: { generated: number };
  incidents?: { total: number; resolved: number };
  courses?: { published: number };
  // Legacy flat fields (fallback)
  regulationsCount?: number;
  templatesCount?: number;
  checklistsCount?: number;
  coursesCount?: number;
  incidentsCount?: number;
  usersCount?: number;
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  const json: ApiResponse<T> = await res.json();
  if (!res.ok || json.error) {
    const errorMsg = json.error?.message || `HTTP ${res.status}: Gagal memuat data`;
    throw new Error(errorMsg);
  }

  return json.data;
}

export const api = {
  // Regulasi
  getRegulations: async (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category && params.category !== 'SEMUA') searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return fetcher<Regulation[]>(`/regulations${qs ? `?${qs}` : ''}`);
  },

  getRegulation: async (id: string) => {
    return fetcher<Regulation>(`/regulations/${id}`);
  },

  // Checklists
  getChecklistTemplates: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return fetcher<ChecklistTemplate[]>(`/checklists/templates${qs ? `?${qs}` : ''}`);
  },

  getChecklistTemplate: async (id: string) => {
    return fetcher<ChecklistTemplate>(`/checklists/templates/${id}`);
  },

  // Dokumen / Template Legal
  getDocTemplates: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return fetcher<DocTemplate[]>(`/templates${qs ? `?${qs}` : ''}`);
  },

  getDocTemplate: async (id: string) => {
    return fetcher<DocTemplate>(`/templates/${id}`);
  },

  generateDocument: async (templateId: string, answers: Record<string, string>) => {
    return fetcher<{ id: string; title: string; content: string }>(`/templates/${templateId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Edukasi / Kursus
  getCourses: async (params?: { targetAudience?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.targetAudience) searchParams.set('targetAudience', params.targetAudience);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return fetcher<Course[]>(`/courses${qs ? `?${qs}` : ''}`);
  },

  getCourse: async (id: string) => {
    return fetcher<Course>(`/courses/${id}`);
  },

  // Insiden
  getIncidents: async () => {
    return fetcher<Incident[]>('/incidents');
  },

  getIncident: async (id: string) => {
    return fetcher<Incident>(`/incidents/${id}`);
  },

  createIncident: async (data: {
    incidentTypeId: string;
    title: string;
    description: string;
    severity?: string;
  }) => {
    return fetcher<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateIncidentStatus: async (id: string, status: string) => {
    return fetcher<Incident>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Asisten AI Chat
  sendChatMessage: async (message: string, sessionId?: string) => {
    return fetcher<{ sessionId: string; message: { id: string; role: string; content: string; citations?: string[] } }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  },

  // Analytics
  getAnalyticsSummary: async () => {
    return fetcher<AnalyticsSummary>('/analytics/summary');
  },

  getActivityLog: async (days: number = 30) => {
    return fetcher<any[]>(`/analytics/activity?days=${days}`);
  },

  // User Profile
  getMe: async () => {
    return fetcher<{ id: string; name: string; email: string; role: string; createdAt: string }>('/users/me');
  },

  updateProfile: async (data: { name?: string }) => {
    return fetcher<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Pencarian Cerdas
  searchRegulations: async (q: string) => {
    return fetcher<any[]>(`/search?q=${encodeURIComponent(q)}`);
  },
};
