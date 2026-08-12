import api from "./api";

export type Url = {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  isDeleted: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateShortUrlPayload = {
  originalUrl: string;
  customAlias?: string;
};

export type UpdateUrlPayload = {
  originalUrl?: string;
  customAlias?: string;
  expiresAt?: string | null;
};

export type GetMyUrlsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetMyUrlsResponse = {
  urls: Url[];
  pagination: Pagination;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const urlService = {
  createShortUrl: async (
    payload: CreateShortUrlPayload,
  ): Promise<ApiResponse<Url>> => {
    const response = await api.post<ApiResponse<Url>>("/urls", payload);

    return response.data;
  },

  getMyUrls: async (
    params?: GetMyUrlsParams,
  ): Promise<ApiResponse<GetMyUrlsResponse>> => {
    const response = await api.get<ApiResponse<GetMyUrlsResponse>>("/urls", {
      params,
    });

    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Url>> => {
    const response = await api.get<ApiResponse<Url>>(`/urls/id/${id}`);

    return response.data;
  },

  update: async (
    id: string,
    payload: UpdateUrlPayload,
  ): Promise<ApiResponse<Url>> => {
    const response = await api.patch<ApiResponse<Url>>(
      `/urls/id/${id}`,
      payload,
    );

    return response.data;
  },

  activate: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>(
      `/urls/id/${id}/activate`,
    );

    return response.data;
  },

  deactivate: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>(
      `/urls/id/${id}/deactivate`,
    );

    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/urls/id/${id}`);

    return response.data;
  },

  bulkDelete: async (ids: string[]): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>("/urls/bulk", {
      data: {
        ids,
      },
    });

    return response.data;
  },

  bulkRestore: async (ids: string[]): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>("/urls/bulk/restore", {
      ids,
    });

    return response.data;
  },

  bulkDeactivate: async (ids: string[]): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>(
      "/urls/bulk/deactivate",
      {
        ids,
      },
    );

    return response.data;
  },
};
