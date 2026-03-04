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
        // ส่ง error ที่ละเอียดขึ้น
        throw error?.response?.data || error?.message || error;
      });
  }

  async deleteTitle(id: string): Promise<IApiDeleteResponse> {
    return this.delete(`/titles/${id}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async checkTitleInUse(id: string): Promise<boolean> {
    return this.get(`/titles/${id}/check-usage`)
      .then((response) => response?.data?.inUse ?? false)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getAllTitlesUsage(titleIds: string[]): Promise<Record<string, boolean>> {
    try {
      // Check usage for each title in parallel
      const results = await Promise.all(
        titleIds.map(async (id) => {
          try {
            const inUse = await this.checkTitleInUse(id);
            return { id, inUse };
          } catch {
            return { id, inUse: false };
          }
        })
      );
      
      const usageMap: Record<string, boolean> = {};
      results.forEach(({ id, inUse }) => {
        usageMap[id] = inUse;
      });
      return usageMap;
    } catch {
      return {};
    }
  }
}

export const titleService = new TitleService();
