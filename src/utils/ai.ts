import { Model, Settings, ContentType, GenerationMode } from '@/types';

/**
 * Генерация контента с помощью kie.ai
 */
export async function generateContent(
  model: Model,
  contentType: ContentType,
  mode: GenerationMode,
  settings: Settings
): Promise<string> {
  if (!settings.kieApiKey) {
    throw new Error('API-ключ kie.ai не настроен. Перейдите в Настройки.');
  }
  
  // Выбор промпта в зависимости от типа контента
  let prompt = '';
  switch (contentType) {
    case 'wbTitle':
      prompt = settings.wbTitlePrompt;
      break;
    case 'wbDescription':
      prompt = settings.wbDescriptionPrompt;
      break;
    case 'ozonTitle':
      prompt = settings.ozonTitlePrompt;
      break;
    case 'ozonDescription':
      prompt = settings.ozonDescriptionPrompt;
      break;
  }
  
  // Замена плейсхолдеров в промпте
  prompt = prompt
    .replace('{name}', model.name)
    .replace('{description}', model.description)
    .replace('{specifications}', model.specifications);
  
  // Если детальная генерация, добавляем промпт для анализа изображений
  if (mode === 'detailed') {
    prompt = `${settings.detailedGenerationPrompt}\n\n${prompt}`;
  }
  
  try {
    // Вызов API kie.ai
    const response = await fetch('https://api.kie.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.kieApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Быстрая модель для генерации
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по созданию продающих описаний для маркетплейсов. Создавай SEO-оптимизированный контент, который привлекает покупателей.'
          },
          {
            role: 'user',
            content: mode === 'detailed' && model.images.length > 0
              ? [
                  { type: 'text', text: prompt },
                  ...model.images.slice(0, 3).map(img => ({
                    type: 'image_url',
                    image_url: { url: img }
                  }))
                ]
              : prompt
          }
        ],
        max_tokens: contentType.includes('Title') ? 100 : 1000,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка API');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
    
  } catch (error) {
    console.error('Ошибка генерации контента:', error);
    if (error instanceof Error) {
      throw new Error(`Ошибка генерации: ${error.message}`);
    }
    throw new Error('Не удалось сгенерировать контент. Проверьте API-ключ и подключение к интернету.');
  }
}

/**
 * Проверка валидности API-ключа
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  try {
    const response = await fetch('https://api.kie.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    return response.ok;
  } catch {
    return false;
  }
}
