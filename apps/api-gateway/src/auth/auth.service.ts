import { AuthResponse, SERVICES_PORTS, UserProfileResponse } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServerUrl = `http://localhost:${SERVICES_PORTS.AUTH_SERVICE}`;

  constructor(private readonly httpService: HttpService) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<UserProfileResponse>(
          `${this.authServerUrl}/register`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<AuthResponse>(
          `${this.authServerUrl}/login`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(token: string): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserProfileResponse>(
          `${this.authServerUrl}/profile`,
          {
            headers: { Authorization: token },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(error.response.data, error.response.status);
    }

    throw new HttpException('Что-то пошло не так', 503);
  }
}
