import {
  IApiDeleteResponse,
  IApiDeleteManyResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
  IApiGetByIdResponse,
} from '@/types/index';
import { APIService } from './api.service';
import { IMilestone } from '@/types/milestone';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class MilestoneService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllMilestone(): Promise<IApiGetResponse<IMilestone>> {
    return this.get('/milestones')
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
