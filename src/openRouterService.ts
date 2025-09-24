import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private model: string;

  constructor(apiKey: string, model: string = 'meta-llama/llama-3.1-8b-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async sendMessage(
    messages: OpenRouterMessage[],
    maxTokens: number = 1000,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const response: AxiosResponse<OpenRouterResponse> = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://homework-bot-telegram.com', // Опционально, для отслеживания
            'X-Title': 'Homework Bot' // Опционально, для идентификации
          }
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Пустой ответ от OpenRouter API');
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса в OpenRouter:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          throw new Error(`OpenRouter API ошибка ${status}: ${JSON.stringify(data)}`);
        } else if (error.request) {
          throw new Error('Нет ответа от OpenRouter API. Проверьте подключение к интернету.');
        }
      }
      
      throw new Error(`Неизвестная ошибка: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async sendUserMessage(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: OpenRouterMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: userMessage
    });

    return await this.sendMessage(messages);
  }

  async sendMessageWithImage(
    userMessage: string, 
    imagePath: string, 
    systemPrompt?: string
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Читаем изображение и конвертируем в base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(imagePath);
    
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: userMessage
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        }
      ]
    });

    return await this.sendMessage(messages);
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  // Метод для получения доступных моделей (опционально)
  async getAvailableModels(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка моделей:', error);
      throw error;
    }
  }
}
