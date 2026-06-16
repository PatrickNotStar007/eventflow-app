import { SERVICES_PORTS } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EventsService {
  private readonly eventsServiceUrl = `http://localhost:${SERVICES_PORTS.EVENTS_SERVICE}`;

  constructor(private readonly httpService: HttpService) {}

  async create(data: object, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.eventsServiceUrl, data, {
          headers: { 'x-user-id': userId, 'x-user-role': userRole },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.eventsServiceUrl),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findMyEvents(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.eventsServiceUrl}/my-events`, {
          headers: { 'x-user-id': userId },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.eventsServiceUrl}/${id}`),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, data: object, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.eventsServiceUrl}/${id}`, data, {
          headers: { 'x-user-id': userId, 'x-user-role': userRole },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async publish(id: string, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.eventsServiceUrl}/${id}/publish`,
          {},
          {
            headers: { 'x-user-id': userId, 'x-user-role': userRole },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancel(id: string, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.eventsServiceUrl}/${id}/cancel`,
          {},
          {
            headers: { 'x-user-id': userId, 'x-user-role': userRole },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    const err = error as {
      response?: { data: string | object; status: number };
    };

    if (err.response) {
      throw new HttpException(err.response.data, err.response.status);
    }

    throw new HttpException('Что-то пошло не так', 503);
  }
}
