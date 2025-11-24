import {
  IApiDeleteResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
} from '@/types/index';

import { APIService } from './api.service';
import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
  IMilestoneStepUpdateDTO,
} from '@/types/milestonestep';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class MilestoneStepService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  // GET ALL
  async getAllMilestoneSteps(): Promise<IApiGetResponse<IMilestoneStep>> {
    return this.get('/milestone-steps')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // GET BY ID
  async getMilestoneStepById(id: string): Promise<IMilestoneStep> {
    return this.get(`/milestone-steps/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // GET BY MILESTONE ID
  async getMilestoneStepsByMilestoneId(milestoneId: string) {
    return this.get(`/milestone-steps/milestone/${milestoneId}`).then(
      (res) => res?.data,
    ); // ได้ { data: [...], pageCount: n }
  }

  // CREATE
  async createMilestoneStep(
    payload: IMilestoneStepCreateDTO,
  ): Promise<IApiPostResponse<IMilestoneStep>> {
    return this.post('/milestone-steps', payload)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // UPDATE
  async updateMilestoneStep(
    id: string,
    payload: IMilestoneStepUpdateDTO,
  ): Promise<IApiPatchResponse<IMilestoneStep>> {
    return this.patch(`/milestone-steps/${id}`, payload)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // DELETE ONE
  async deleteMilestoneStep(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/milestone-steps/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // DELETE MULTIPLE
  async deleteMilestoneStepsBulk(ids: string[]): Promise<IApiDeleteResponse> {
    return this.delete('/milestone-steps/bulk-delete', { ids })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const milestonestepService = new MilestoneStepService();
