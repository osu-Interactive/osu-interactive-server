import axios, { AxiosResponse } from 'axios';

interface OsuTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class OsuApiClient {
    private clientId: string;
    private clientSecret: string;
    private baseUrl: string;

    private accessToken: string | null = null;
    private tokenExpiresAt: number | null = null;
    private tokenPromise: Promise<string> | null = null;

    private static instance: OsuApiClient;

    private constructor() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID or CLIENT_SECRET is not defined');
        }

        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;

        this.baseUrl = 'https://osu.ppy.sh/api/v2';
    }

    public static getInstance(): OsuApiClient {
        if (!OsuApiClient.instance) {
            OsuApiClient.instance = new OsuApiClient();
        }
        return OsuApiClient.instance;
    }

    private async fetchAccessToken(): Promise<{ token: string; expiresIn: number }> {
        const response: AxiosResponse<OsuTokenResponse> = await axios.post(
            'https://osu.ppy.sh/oauth/token',
            `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&scope=public`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
            }
        );

        return {
            token: response.data.access_token,
            expiresIn: response.data.expires_in,
        };
    }

    private async ensureToken(): Promise<string> {
        if (
            this.accessToken &&
            this.tokenExpiresAt &&
            Date.now() < this.tokenExpiresAt
        ) {
            return this.accessToken;
        }

        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        this.tokenPromise = this.fetchAccessToken().then(({ token, expiresIn }) => {
            this.accessToken = token;
            this.tokenExpiresAt = Date.now() + expiresIn * 1000 - 5000;

            this.tokenPromise = null;
            return token;
        });

        return this.tokenPromise;
    }

    public async get<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
        const token = await this.ensureToken();

        return axios.get<T>(this.baseUrl + endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    public async post<T = any>(
        endpoint: string,
        data?: any
    ): Promise<AxiosResponse<T>> {
        const token = await this.ensureToken();

        return axios.post<T>(this.baseUrl + endpoint, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export const osuApiClient = OsuApiClient.getInstance();
