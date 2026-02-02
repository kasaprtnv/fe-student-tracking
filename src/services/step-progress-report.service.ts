import { IApiGetResponse } from '@/types/index';
import { APIService } from './api.service';
import {
  IStepProgressReport,
  IStepProgressReportFilter,
} from '@/types/step-progress-report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class StepProgressReportService extends APIService {
  constructor(baseURL?: string) {
    super(baseURL ?? API_BASE_URL);
  }

  async getStepProgressReport(
    filter: IStepProgressReportFilter,
  ): Promise<IApiGetResponse<IStepProgressReport>> {
    return this.post('/step-progress-report', filter)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const stepProgressReportService = new StepProgressReportService();
