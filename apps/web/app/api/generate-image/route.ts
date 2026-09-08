import { NextRequest, NextResponse } from 'next/server';
import { buildConsistentVisualPrompt } from '@/lib/character-logic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = '',
      characterName,
      sceneNumber = 1,
      userInstruction = '',
      width = 768,
      height = 1344
    } = body;

    let finalPrompt = '';
    let fallbackImageUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80';

    if (prompt && prompt.trim().length > 3) {
      // Direct custom AI prompt from user input
      finalPrompt = `8k vertical portrait, ${prompt.trim()}, cinematic lighting, photorealistic, 85mm lens, natural skin texture, masterpiece, highly detailed`;
    } else if (characterName) {
      // Use Character DNA logic
      const result = buildConsistentVisualPrompt(
        characterName,
        'Modern architectural executive background',
        userInstruction,
        sceneNumber
      );
      finalPrompt = result.prompt;
      fallbackImageUrl = result.fallbackImageUrl;
    } else {
      finalPrompt = '8k vertical portrait of modern professional business leader, cinematic lighting, 85mm lens, photorealistic';
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    return NextResponse.json({
      status: 'SUCCESS',
      imageUrl,
      fallbackImageUrl,
      promptUsed: finalPrompt
    });
  } catch (error: any) {
    console.error('API /generate-image error:', error);
    return NextResponse.json(
      {
        status: 'SUCCESS',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
        message: 'Using fallback image'
      }
    );
  }
}
