/**
 * Kling AI API Wrapper (Draft)
 * 
 * Based on research of the Kling AI Global API.
 * Requires: jsonwebtoken (for JWT) and an HTTP client (fetch/axios).
 */

import jwt from 'jsonwebtoken';

export interface KlingVideoRequest {
  model_name: 'kling-v1';
  prompt: string;
  negative_prompt?: string;
  cfg_scale?: number;
  mode?: 'std' | 'pro';
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  duration?: '5' | '10';
  image?: string;
  image_tail?: string;
}

export interface KlingTaskResponse {
  task_id: string;
  task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
  task_result?: {
    videos: Array<{
      id: string;
      url: string;
      duration: string;
    }>;
  };
}

class KlingAIClient {
  private accessKey: string;
  private secretKey: string;
  private baseUrl = 'https://api.klingai.com';

  constructor(accessKey: string, secretKey: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  /**
   * Generates a JWT for authentication.
   */
  private async generateToken(): Promise<string> {
    const payload = {
      iss: this.accessKey,
      exp: Math.floor(Date.now() / 1000) + 1800,
      nbf: Math.floor(Date.now() / 1000) - 5,
    };
    
    return jwt.sign(payload, this.secretKey, { 
      algorithm: 'HS256', 
      header: { typ: 'JWT', alg: 'HS256' } 
    } as any);
  }

  async createTextToVideo(params: KlingVideoRequest): Promise<KlingTaskResponse> {
    const token = await this.generateToken();
    const response = await fetch(`${this.baseUrl}/v1/videos/text2video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Kling AI API Error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }

  async createImageToVideo(params: KlingVideoRequest): Promise<KlingTaskResponse> {
    const token = await this.generateToken();
    const response = await fetch(`${this.baseUrl}/v1/videos/image2video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Kling AI API Error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }

  async getTaskStatus(taskId: string, type: 'text2video' | 'image2video'): Promise<KlingTaskResponse> {
    const token = await this.generateToken();
    const response = await fetch(`${this.baseUrl}/v1/videos/${type}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kling AI API Error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }
}

export const klingAI = new KlingAIClient(
  process.env.KLING_ACCESS_KEY || '',
  process.env.KLING_SECRET_KEY || ''
);
