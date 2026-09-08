import fs from 'fs';
import path from 'path';

export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  tag: string;
  description: string;
  recommendedFor: string;
}

export const NEXO_ROUTER_MODELS: AIModelOption[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o Omnimodal',
    provider: 'OpenAI / NexoRouter',
    tag: 'Recomendado',
    description: 'Generación superior de guiones virales, ganchos de 3s y prompts visuales cinematográficos.',
    recommendedFor: 'Minidramas dramáticos y prompts de video 9:16'
  },
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic / NexoRouter',
    tag: 'Máximo Drama',
    description: 'Tensión dramática superior, giros inesperados y diálogos humanos ultra realistas.',
    recommendedFor: 'Historias profundas con clímax emocional'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google / NexoRouter',
    tag: 'Ultra Rápido',
    description: 'Velocidad relámpago y excelente coherencia lógica narrativa en español.',
    recommendedFor: 'Guiones rápidos de negocios y e-commerce'
  },
  {
    id: 'deepseek-ai/DeepSeek-V3.2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek / NexoRouter',
    tag: 'Económico & Preciso',
    description: 'Excelente adaptación a modismos coloquiales y confrontaciones ejecutivas.',
    recommendedFor: 'Diálogos de ventas directas'
  }
];

export const NEXO_ROUTER_VIDEO_MODELS = [
  {
    id: 'wan2.7-t2v',
    name: 'Alibaba Wan 2.7 Video',
    provider: 'Wan-AI / NexoRouter',
    seconds: '5',
    description: 'Generación directa de video cinematográfico 9:16 con física y personas en movimiento real.'
  },
  {
    id: 'MiniMax-Hailuo-2.3',
    name: 'MiniMax Hailuo 2.3 Video',
    provider: 'MiniMax / NexoRouter',
    seconds: '6',
    description: 'Movimiento orgánico de alta fidelidad, parpadeo y gesticulación natural.'
  }
];

export function getNexoRouterKey(): string {
  return (
    process.env.NEXO_ROUTER ||
    process.env.OPENROUTER_API_KEY ||
    'sk-XaH9jvF4LyuKIKHkRS8O6aDX9gVrOmZPouIvHkrM64Fo6BL8'
  ).trim();
}

export function getNexoRouterBaseUrl(): string {
  return (process.env.NEXO_ROUTER_BASE_URL || 'https://api.nexorouter.com/v1').trim();
}

/**
 * Executes a Chat Completion request through NexoRouter's official gateway
 */
export async function callNexoRouterChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = 'openai/gpt-4o',
  temperature: number = 0.7,
  responseFormatJson: boolean = false
): Promise<string> {
  const apiKey = getNexoRouterKey();
  const baseUrl = getNexoRouterBaseUrl();

  if (!apiKey) {
    throw new Error('NEXO_ROUTER API key not configured');
  }

  const payload: any = {
    model,
    messages,
    temperature,
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'DramaFlow AI SaaS Engine',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NexoRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return text;
}

/**
 * Creates an asynchronous REAL VIDEO generation job on NexoRouter
 */
export async function createNexoRouterVideoTask(
  prompt: string,
  model: string = 'wan2.7-t2v',
  seconds: string = '5',
  aspectRatio: string = '9:16',
  inputReference?: string
): Promise<{ taskId: string; model: string; size: string }> {
  const apiKey = getNexoRouterKey();
  const baseUrl = getNexoRouterBaseUrl();

  const bodyPayload: any = {
    model,
    prompt,
    aspect_ratio: aspectRatio,
    seconds: seconds,
  };

  if (inputReference) {
    bodyPayload.input_reference = inputReference;
  }

  const res = await fetch(`${baseUrl}/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NexoRouter Video Job creation failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const taskId = data.task_id || data.id;
  return {
    taskId,
    model: data.model || model,
    size: data.size || '1280x720',
  };
}

/**
 * Polls the status of a NexoRouter video task
 */
export async function pollNexoRouterVideoTask(taskId: string): Promise<{
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  completedAt?: number;
}> {
  const apiKey = getNexoRouterKey();
  const baseUrl = getNexoRouterBaseUrl();

  const res = await fetch(`${baseUrl}/videos/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to check NexoRouter video task ${taskId}: status ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.status,
    progress: data.progress || (data.status === 'completed' ? 100 : 0),
    completedAt: data.completed_at,
  };
}

/**
 * Downloads the completed MP4 video file from NexoRouter and stores it locally in public/videos
 */
export async function downloadNexoRouterVideoContent(taskId: string, localFilePath: string): Promise<string> {
  const apiKey = getNexoRouterKey();
  const baseUrl = getNexoRouterBaseUrl();

  const res = await fetch(`${baseUrl}/videos/${taskId}/content`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download video content for task ${taskId}: status ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const dir = path.dirname(localFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(localFilePath, buffer);
  return localFilePath;
}

/**
 * Complete structured drama script generation using NexoRouter
 */
export async function generateDramaScriptWithNexoRouter(params: {
  niche: string;
  valueProp: string;
  archetype: string;
  customInstructions?: string;
  targetAudience?: string;
  model?: string;
  customCharacters?: Array<{ name: string; role: string; imageUrl?: string; voiceProfile?: string }>;
}): Promise<any> {
  const {
    niche,
    valueProp,
    archetype,
    customInstructions = '',
    targetAudience = 'Dueños de negocios y emprendedores',
    model = 'openai/gpt-4o',
    customCharacters = [],
  } = params;

  const char1 = customCharacters[0] || { name: 'Marcos', role: 'Directivo Escéptico' };
  const char2 = customCharacters[1] || { name: 'Elena', role: 'Fundadora Estratega' };

  const systemPrompt = `Sos el guionista y director creativo número 1 del mundo en Minidramas verticales para TikTok/Reels de retención extrema (>90%).
Tu objetivo es escribir un drama empresarial adictivo de 4 escenas verticales 9:16 entre dos personajes contrapuestos.
REGLAS OBLIGATORIAS:
- Idioma: Español coloquial con ritmo ágil, tensión dramática y confrontación de negocios.
- Escena 1 debe tener un gancho demoledor en los primeros 3 segundos.
- Cada escena debe incluir un visual_prompt cinematográfico detallado para generación de video generativo real.
- Respondé ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{
  "title": "Título llamativo",
  "hook": "Gancho inicial de 3 segundos",
  "logline": "Resumen de una frase del conflicto",
  "characters": [
    { "name": "${char1.name}", "voice_type": "single_voice", "role": "${char1.role}" },
    { "name": "${char2.name}", "voice_type": "single_voice", "role": "${char2.role}" }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 5,
      "character": "${char1.name}",
      "dialogue": "Diálogo potente",
      "visual_prompt": "Cinematic vertical 9:16 video prompt in English...",
      "camera_motion": "zoom_in"
    },
    ... (4 escenas en total)
  ]
}`;

  const userPrompt = `Crea un minidrama de alto impacto:
- Nicho: ${niche}
- Propuesta de valor / Clímax: ${valueProp}
- Arquetipo narrativo: ${archetype}
- Audiencia objetivo: ${targetAudience}
- Personajes: ${char1.name} (${char1.role}) vs ${char2.name} (${char2.role})
${customInstructions ? `- Instrucciones adicionales: ${customInstructions}` : ''}`;

  try {
    const responseText = await callNexoRouterChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model,
      0.7,
      true
    );

    // Parse JSON
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.error('NexoRouter script parsing failed, using fallback:', error);
    // Fallback script if parse fails
    return {
      title: `El Giro Decisivo en ${niche}`,
      hook: `¡Frená todo, ${char2.name}! ¿Cómo lograste resolver esto en ${niche}?`,
      logline: `Una confrontación decisiva donde ${char2.name} demuestra el poder de ${valueProp}.`,
      characters: [
        { name: char1.name, voice_type: 'single_voice', role: char1.role },
        { name: char2.name, voice_type: 'single_voice', role: char2.role },
      ],
      scenes: [
        {
          scene_number: 1,
          duration_seconds: 5,
          character: char1.name,
          dialogue: `¡Frená todo, ${char2.name}! ¿Me estás diciendo que con ${char2.role} no podemos resolver esto en ${niche}?`,
          visual_prompt: 'A dramatic businessman in an executive office, high tension, 9:16 vertical video',
          camera_motion: 'zoom_in',
          videoUrl: '/videos/nexorouter_wan_drama.mp4'
        },
        {
          scene_number: 2,
          duration_seconds: 6,
          character: char2.name,
          dialogue: `Tranquilo, ${char1.name}. Mirá los datos en tiempo real: activamos ${valueProp} y multiplicamos las ventas por cuatro.`,
          visual_prompt: 'A confident businesswoman presenting real-time growth analytics on tablet, 9:16 vertical video',
          camera_motion: 'pan_up',
          videoUrl: '/videos/dramaflow_proj_master_01.mp4'
        },
        {
          scene_number: 3,
          duration_seconds: 6,
          character: char1.name,
          dialogue: `Pará un segundo... ¿cómo conseguiste triplicar los clientes calificados en menos de 48 horas?!`,
          visual_prompt: 'Close-up dramatic expression of directer in disbelief looking at screen, 9:16 vertical video',
          camera_motion: 'shake',
          videoUrl: '/videos/sample_drama.mp4'
        },
        {
          scene_number: 4,
          duration_seconds: 7,
          character: char2.name,
          dialogue: `Porque dejamos de perder tiempo y aplicamos ${valueProp}. Si querés el mismo resultado, escribinos ahora.`,
          visual_prompt: 'Heroic portrait shot of woman founder in modern studio, neon lighting, cinematic 9:16 vertical video',
          camera_motion: 'zoom_out',
          videoUrl: '/videos/dramaflow_proj_01.mp4'
        }
      ]
    };
  }
}
