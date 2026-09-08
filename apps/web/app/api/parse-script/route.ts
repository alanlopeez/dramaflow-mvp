import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { DramaScriptPayload } from '@/lib/gcp-vertex';
import { resolveCharacterDNA } from '@/lib/character-logic';

const projectId = process.env.GCP_PROJECT_ID || 'dramaflow-mvp-1787884887';
const location = process.env.GCP_REGION || 'us-central1';

let vertexAI: VertexAI | null = null;
try {
  vertexAI = new VertexAI({ project: projectId, location: location });
} catch (err) {
  console.warn('Vertex AI client init in parse-script:', err);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawScript = '' } = body;

    if (!rawScript || rawScript.trim().length < 5) {
      return NextResponse.json(
        { status: 'ERROR', message: 'El texto del guión es demasiado corto.' },
        { status: 400 }
      );
    }

    // Extract Title
    const titleMatch = rawScript.match(/(?:TÍTULO|TITULO):\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Guión Personalizado de DramaFlow';

    // Extract Hook
    const hookMatch = rawScript.match(/(?:GANCHO|HOOK):\s*["“]?([^"”\n]+)["”]?/i);
    let hook = hookMatch ? hookMatch[1].trim() : 'El momento exacto en que te das cuenta del truco.';

    // Extract Logline
    const loglineMatch = rawScript.match(/(?:LOGLINE|RESUMEN):\s*(.+)/i);
    let logline = loglineMatch ? loglineMatch[1].trim() : 'Una confrontación decisiva revela la verdad detrás de la propuesta.';

    // Extract Characters block (e.g., "PERSONAJES: • Anastasia ... • Marcos ...")
    const characterList: Array<{ name: string; role: string; voice_type: string; imageUrl?: string }> = [];
    const charBlockMatch = rawScript.match(/PERSONAJES:([\s\S]*?)(?:━|---|\[ESCENA)/i);
    if (charBlockMatch) {
      const charLines = charBlockMatch[1].split('\n').map((l: string) => l.trim()).filter((l: string) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
      for (const cl of charLines) {
        const cMatch = cl.match(/[•\-\*]\s*([^(]+)(?:\(([^)]+)\))?/);
        if (cMatch) {
          const cName = cMatch[1].trim();
          const cRole = cMatch[2] ? cMatch[2].trim() : 'Personaje';
          const dna = resolveCharacterDNA(cName, cRole);
          characterList.push({
            name: cName,
            role: cRole,
            voice_type: dna.gender === 'female' ? 'founder_female' : 'executive_male',
            imageUrl: dna.defaultImageUrl
          });
        }
      }
    }

    // Extract Scenes from [ESCENA X] blocks
    const sceneRegex = /\[ESCENA\s*(\d+)[^\]]*\]\s*(?:👤\s*)?([^:\n]+)[:\n]([\s\S]*?)(?=(?:\[ESCENA\s*\d+|$))/gi;
    let parsedScenes: any[] = [];
    let match;

    while ((match = sceneRegex.exec(rawScript)) !== null) {
      const sceneNum = parseInt(match[1], 10);
      const rawCharName = match[2]?.replace(/👤/g, '').trim() || `Personaje ${sceneNum}`;
      const sceneBody = match[3] || '';

      // Extract dialogue (lines in quotes or first non-metadata line)
      let dialogue = '';
      const dialogueQuoteMatch = sceneBody.match(/["“]([^"”]+)["”]/);
      if (dialogueQuoteMatch) {
        dialogue = dialogueQuoteMatch[1].trim();
      } else {
        const lines = sceneBody.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0 && !l.startsWith('🎥') && !l.startsWith('🔊') && !l.startsWith('Visual:') && !l.startsWith('Efecto:'));
        dialogue = lines[0] || 'Diálogo adaptado para la escena.';
      }

      // Extract duration
      const durMatch = match[0].match(/(\d+)\s*s/i);
      const durationSeconds = durMatch ? parseInt(durMatch[1], 10) : 7;

      // Extract Visual Prompt
      const visualMatch = sceneBody.match(/(?:🎥\s*Visual:|Visual:)\s*([^\n]+)/i);
      const visualPrompt = visualMatch ? visualMatch[1].trim() : `Toma cinematográfica vertical 9:16 de ${rawCharName}, iluminación dramática 8k.`;

      // Extract Camera Motion
      const cameraMatch = sceneBody.match(/(?:Cámara:|Camara:)\s*(\w+)/i);
      const cameraMotion = cameraMatch ? (cameraMatch[1].toLowerCase() as any) : (['zoom_in', 'pan_up', 'shake', 'zoom_out'][(sceneNum - 1) % 4]);

      // Extract Sound Effect
      const soundMatch = sceneBody.match(/(?:🔊\s*Efecto:|Efecto:)\s*([^\s|]+)/i);
      const soundEffect = soundMatch ? soundMatch[1].trim() : (['dramatic_boom', 'glitch_riser', 'heartbeat_fast', 'epic_whoosh'][(sceneNum - 1) % 4]);

      const dna = resolveCharacterDNA(rawCharName);

      parsedScenes.push({
        scene_number: sceneNum,
        duration_seconds: durationSeconds,
        character: rawCharName,
        dialogue,
        visual_prompt: visualPrompt,
        imageUrl: dna.defaultImageUrl,
        camera_motion: cameraMotion,
        sound_effect: soundEffect
      });
    }

    // Fallback: If no [ESCENA] blocks matched, parse line-by-line dialogues
    if (parsedScenes.length === 0) {
      const lines = rawScript.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      const linePairs: Array<{ char: string; text: string }> = [];

      for (const line of lines) {
        const pMatch = line.match(/^([^:\-\–\—]{2,20})[:\-\–\—]\s*(.*)$/);
        if (pMatch) {
          linePairs.push({ char: pMatch[1].trim(), text: pMatch[2].trim() });
        } else if (line.length > 10 && !line.startsWith('TÍTULO') && !line.startsWith('GANCHO') && !line.startsWith('LOGLINE')) {
          linePairs.push({ char: linePairs.length % 2 === 0 ? 'Protagonista' : 'Antagonista', text: line });
        }
      }

      for (let i = 0; i < 4; i++) {
        const pair = linePairs[i] || {
          char: i % 2 === 0 ? (characterList[0]?.name || 'Protagonista') : (characterList[1]?.name || 'Antagonista'),
          text: `Diálogo de la escena ${i + 1} adaptado al minidrama.`
        };
        const dna = resolveCharacterDNA(pair.char);
        parsedScenes.push({
          scene_number: i + 1,
          duration_seconds: 7,
          character: pair.char,
          dialogue: pair.text.replace(/^["“]|["”]$/g, ''),
          visual_prompt: `Toma cinematográfica vertical 9:16 con ${pair.char}, iluminación dramática.`,
          imageUrl: dna.defaultImageUrl,
          camera_motion: (['zoom_in', 'pan_up', 'shake', 'zoom_out'] as const)[i],
          sound_effect: (['dramatic_boom', 'glitch_riser', 'heartbeat_fast', 'epic_whoosh'] as const)[i]
        });
      }
    }

    // Ensure exactly 4 scenes
    while (parsedScenes.length < 4) {
      const nextNum = parsedScenes.length + 1;
      const char = parsedScenes[0]?.character || 'Protagonista';
      const dna = resolveCharacterDNA(char);
      parsedScenes.push({
        scene_number: nextNum,
        duration_seconds: 7,
        character: char,
        dialogue: `Resolución y llamada a la acción de la escena ${nextNum}.`,
        visual_prompt: `Toma vertical 9:16 con ${char}, iluminación cinematográfica 8k.`,
        imageUrl: dna.defaultImageUrl,
        camera_motion: 'zoom_out',
        sound_effect: 'epic_whoosh'
      });
    }

    // 🌟 SMART GLOBAL CHARACTER SYNCHRONIZATION & CONSISTENCY ENGINE
    // Detect if default template names like "Elena" were replaced with custom names like "Anastasia"
    const knownDefaultNames = ['Elena', 'Sofía', 'Sofia', 'Lucía', 'Lucia', 'Carlos', 'David', 'Marcos'];

    if (characterList.length > 0) {
      // Find declared names that are NOT in defaults (e.g., Anastasia, Alan, etc.)
      const customDeclared = characterList.filter(c => !knownDefaultNames.some(d => d.toLowerCase() === c.name.toLowerCase()));
      
      // If user declared a custom protagonist (e.g. Anastasia) to replace Elena:
      if (customDeclared.length > 0) {
        customDeclared.forEach((customChar) => {
          // Identify old name (e.g., Elena if custom is female, or Marcos if male)
          const targetToReplace = customChar.voice_type === 'founder_female' ? 'Elena' : 'Marcos';
          const nameRegex = new RegExp(`\\b${targetToReplace}\\b`, 'gi');

          // 1. Replace in all scenes character property
          parsedScenes.forEach(scene => {
            if (scene.character.toLowerCase() === targetToReplace.toLowerCase()) {
              scene.character = customChar.name;
              scene.imageUrl = customChar.imageUrl || scene.imageUrl;
            }
            // 2. Replace in spoken dialogues (e.g. "Armá las valijas, Elena." -> "Armá las valijas, Anastasia.")
            scene.dialogue = scene.dialogue.replace(nameRegex, customChar.name);
            // 3. Replace in visual prompts
            scene.visual_prompt = scene.visual_prompt.replace(nameRegex, customChar.name);
          });

          // 4. Replace in Hook and Logline
          hook = hook.replace(nameRegex, customChar.name);
          logline = logline.replace(nameRegex, customChar.name);
        });
      }
    } else {
      // Build characterList from distinct characters in scenes
      const distinctChars = Array.from(new Set(parsedScenes.map(s => s.character)));
      distinctChars.forEach(c => {
        const dna = resolveCharacterDNA(c);
        characterList.push({
          name: c,
          role: dna.role || 'Personaje Principal',
          voice_type: dna.gender === 'female' ? 'founder_female' : 'executive_male',
          imageUrl: dna.defaultImageUrl
        });
      });
    }

    const finalScript: DramaScriptPayload = {
      title,
      hook: hook || parsedScenes[0]?.dialogue || 'El momento exacto en que te das cuenta del truco.',
      logline,
      characters: characterList,
      scenes: parsedScenes.slice(0, 4)
    };

    return NextResponse.json({ status: 'SUCCESS', data: finalScript });
  } catch (error: any) {
    console.error('API /parse-script error:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message || 'Error al procesar el guión.' },
      { status: 500 }
    );
  }
}
