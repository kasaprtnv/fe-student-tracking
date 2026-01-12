import { ITitle, ITitleCreateDTO } from '@/types/title';
import {
  IApiDeleteResponse,
  IApiGetResponse,
  IApiPatchResponse,
  IApiPostResponse,
} from '@/types/index';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class TitleService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getAllTitles(): Promise<IApiGetResponse<ITitle>> {
    return this.get('/titles')
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getTitleById(id: string): Promise<ITitle> {
    return this.get(`/titles/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createTitle(data: ITitleCreateDTO): Promise<IApiPostResponse<ITitle>> {
    return this.post('/titles', data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateTitle(
    id: string,
    data: Partial<ITitle>,
  ): Promise<IApiPatchResponse<ITitle>> {
    return this.patch(`/titles/${id}`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteTitle(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/titles/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const titleService = new TitleService();
