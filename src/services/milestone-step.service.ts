import { IMilestoneStep } from '@/types/milestone-step';
import {
  IApiDeleteResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
} from '@/types/index';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class MilestoneStepService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllMilestoneSteps(): Promise<IApiGetResponse<IMilestoneStep>> {
    return this.get('/milestone-steps')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestoneStepById(id: string): Promise<IMilestoneStep> {
    return this.get(`/milestone-steps/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestoneStepsByMilestoneId(
    milestoneId: string,
  ): Promise<IApiGetResponse<IMilestoneStep>> {
    return this.get(`/milestone-steps/milestone/${milestoneId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createMilestoneStep(
    data: Partial<IMilestoneStep>,
  ): Promise<IApiPostResponse<IMilestoneStep>> {
    return this.post('/milestone-steps', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateMilestoneStep(
    id: string,
    data: Partial<IMilestoneStep>,
  ): Promise<IApiPatchResponse<IMilestoneStep>> {
    return this.patch(`/milestone-steps/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMilestoneStep(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/milestone-steps/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMultipleMilestoneSteps(
    milestoneStepIds: string[],
  ): Promise<IApiDeleteResponse> {
    return this.delete('/milestone-steps/bulk-delete', {
      ids: milestoneStepIds,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const milestoneStepService = new MilestoneStepService();
