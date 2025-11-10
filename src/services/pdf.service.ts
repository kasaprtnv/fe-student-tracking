import { IApiGetResponse, IPdf } from '@/types';
import { APIService } from './api.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class PdfService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async fetchPdf(path: string): Promise<IApiGetResponse<IPdf>> {
    return this.get(`/pdf/${path}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new Error(`Failed to fetch PDF: ${error}`);
      });
  }
}

export const pdfService = new PdfService();
