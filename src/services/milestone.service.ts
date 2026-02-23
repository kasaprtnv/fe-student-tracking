import {
  IApiDeleteResponse,
  IApiDeleteManyResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
  IApiGetByIdResponse,
} from '@/types/index';
import { APIService } from './api.service';
import { IMilestone, ICourseMilestone } from '@/types/milestone';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class MilestoneService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllMilestone(
    page?: number,
    pageSize?: number,
  ): Promise<IApiGetResponse<IMilestone>> {
    let url = '/milestones';
    if (page !== undefined && pageSize !== undefined) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async searchMilestones(
    searchQuery: string,
    page: number,
    pageSize: number,
  ): Promise<IApiGetResponse<IMilestone>> {
    return this.get(
      `/milestones/search?query=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=${pageSize}`,
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestoneById(id: string): Promise<IApiGetByIdResponse<IMilestone>> {
    return this.get(`/milestones/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestonesByCourseId(
    courseId: string,
  ): Promise<IApiGetResponse<IMilestone>> {
    return this.get(`/milestones/course/${courseId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestonesWithStatusByCourseId(
    courseId: string,
    userId: string,
  ): Promise<IApiGetResponse<IMilestone>> {
    return this.get(`/milestones/course/${courseId}/user/${userId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createMilestone(
    data: Partial<IMilestone>,
  ): Promise<IApiPostResponse<IMilestone>> {
    return this.post('/milestones', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateMilestone(
    id: string,
    data: Partial<IMilestone>,
  ): Promise<IApiPatchResponse<IMilestone>> {
    return this.patch(`/milestones/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async reorderMilestones(
    payload: { id: string; position: number; courseId: string }[],
  ): Promise<{ success: boolean }> {
    return this.patch('/milestones/reorder', payload)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestonesByCourseIdWithPosition(
    courseId: string,
  ): Promise<IApiGetResponse<ICourseMilestone>> {
    return this.get(`/milestones/course/${courseId}/with-position`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async removeCourseMilestone(
    courseId: string,
    milestoneId: string,
  ): Promise<{ success: boolean }> {
    return this.delete(
      `/milestones/course/${courseId}/milestone/${milestoneId}`,
    )
      .then((res) => res.data)
      .catch((error) => {
        const message =
          error?.response?.data?.message || error?.message || 'Unknown error';
        throw new Error(message);
      });
  }

  async deleteMilestone(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/milestones/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMultipleMilestone(
    milestoneId: string[],
  ): Promise<IApiDeleteManyResponse> {
    return this.delete('/milestones/bulk-delete', { ids: milestoneId })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const milestoneService = new MilestoneService();
