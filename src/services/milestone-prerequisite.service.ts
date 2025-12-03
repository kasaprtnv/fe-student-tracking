import {
  IApiDeleteResponse,
  IApiGetResponse,
  IApiPostResponse,
  IApiPatchResponse,
  IApiGetByIdResponse,
} from '@/types/index';

import { APIService } from './api.service';
import {
  IMilestonePrerequisite,
  MilestonePrerequisiteDTO,
} from '@/types/milestone-prerequisite';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class MilestonePrerequisiteService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAll(): Promise<IApiGetResponse<IMilestonePrerequisite>> {
    return this.get('/milestone-prerequisites')
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getById(
    id: string,
  ): Promise<IApiGetByIdResponse<IMilestonePrerequisite>> {
    return this.get(`/milestone-prerequisites/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async create(
    data: Partial<IMilestonePrerequisite>,
  ): Promise<IApiPostResponse<IMilestonePrerequisite>> {
    return this.post('/milestone-prerequisites', data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async createMany(
    items: MilestonePrerequisiteDTO[],
  ): Promise<IApiPostResponse<MilestonePrerequisiteDTO[]>> {
    return this.post('/milestone-prerequisites/many', { items })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async update(
    id: string,
    data: Partial<IMilestonePrerequisite>,
  ): Promise<IApiPatchResponse<IMilestonePrerequisite>> {
    return this.patch(`/milestone-prerequisites/${id}`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async deletePrerequisite(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/milestone-prerequisites/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}

export const milestonePrerequisiteService = new MilestonePrerequisiteService();
