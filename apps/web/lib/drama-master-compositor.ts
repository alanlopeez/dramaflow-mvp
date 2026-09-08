import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { DramaScriptPayload, DramaScene } from './gcp-vertex';

const execPromise = util.promisify(exec);

function getFfmpegPath(): string {
  const directPath = 'C:\\Users\\ALAN\\Desktop\\dramaflow-mvp\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe';
  if (fs.existsSync(directPath)) return directPath;
  return 'ffmpeg';
}

const ELEVEN_VOICE_MAP: Record<string, string> = {
  'ejecutivo_latino': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - Resonant, Authoritative Male
  'fundadora_pro': 'EXAVITQu4vr4xnSDxMaL',    // Sarah - Mature, Confident, Persuasive Female
  'narrador_epico': 'JBFqnCBsd6RMkjVDRZzb',   // George - Warm, Captivating Storyteller
  'tiktoker_rapido': 'TX3LPaxmHKxFdv7VOQHJ',  // Liam - Energetic Social Media Creator
};

const DEFAULT_NEXO_VIDEOS = [
  'public/videos/nexorouter_wan_drama.mp4',
  'public/videos/nexorouter_wan_scene_2.mp4',
  'public/videos/nexorouter_wan_scene_3.mp4',
  'public/videos/nexorouter_wan_scene_4.mp4',
];

async function generateSceneAudio(text: string, voiceId: string, outputPath: string): Promise<string> {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const cleanText = text.replace(/["'\n\r]/g, ' ').trim();

  if (elevenKey) {
    try {
      const elevenVoiceId = ELEVEN_VOICE_MAP[voiceId] || 'CwhRBWXzGAHq8TQ4Fs17';
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
        }),
      });

      if (elRes.ok) {
        const audioBuf = Buffer.from(await elRes.arrayBuffer());
        fs.writeFileSync(outputPath, audioBuf);
        return outputPath;
      }
    } catch (e) {
      console.warn('ElevenLabs fetch failed in compositor, using fallback TTS:', e);
    }
  }

  // Fallback high quality TTS
  const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=es-US&client=tw-ob`;
  const res = await fetch(fallbackUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buf);
  return outputPath;
}

async function getAudioDuration(filePath: string, ffmpegBin: string): Promise<number> {
  try {
    const { stdout, stderr } = await execPromise(`"${ffmpegBin}" -i "${filePath}" 2>&1`);
    const output = (stdout || '') + (stderr || '');
    const match = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      return parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
    }
  } catch (e: any) {
    const output = (e.stdout || '') + (e.stderr || '') + (e.output || '');
    const match = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      return parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
    }
  }
  return 5.5;
}

function generateAssSubtitle(character: string, dialogue: string, duration: number, assPath: string) {
  const isElena = /elena|sofia|fundadora|mujer|female|chica/i.test(character);
  const charColor = isElena ? '&H00E84BA5' : '&H00F0A020';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(2);
    return `0:${m.toString().padStart(2, '0')}:${sec.padStart(5, '0')}`;
  };

  const endFormatted = formatTime(duration);

  const words = dialogue.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const w of words) {
    if ((currentLine + ' ' + w).length > 32) {
      lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = currentLine ? currentLine + ' ' + w : w;
    }
  }
  if (currentLine) lines.push(currentLine);
  const formattedDialogue = lines.join('\\N');

  const content = `[Script Info]
Title: DramaFlow AI Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Header,Arial,38,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,3,10,0,2,80,80,560,1
Style: Subtitle,Arial,52,&H0000E5FF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,100,100,1,0,3,16,0,2,90,90,380,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,${endFormatted},Header,,0,0,0,,{\\c${charColor}}@${character.toUpperCase()} {\\c&H00FFFFFF}Diálogo
Dialogue: 1,0:00:00.00,${endFormatted},Subtitle,,0,0,0,,"${formattedDialogue}"
`;
  fs.writeFileSync(assPath, content, 'utf8');
}

export async function composeFullDramaMaster({
  script,
  voiceId = 'ejecutivo_latino',
  projectId = 'active_minidrama',
}: {
  script: DramaScriptPayload;
  voiceId?: string;
  projectId?: string;
}): Promise<{
  masterVideoPath: string;
  masterVideoUrl: string;
  scenes: DramaScene[];
}> {
  const ffmpegBin = getFfmpegPath();
  const baseDir = process.cwd();
  const workDir = path.join(baseDir, 'temp_render', `render_${Date.now()}`);
  if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

  const publicVideosDir = path.join(baseDir, 'public', 'videos');
  if (!fs.existsSync(publicVideosDir)) fs.mkdirSync(publicVideosDir, { recursive: true });

  const processedScenePaths: string[] = [];
  const updatedScenes: DramaScene[] = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    const sceneNum = scene.scene_number || i + 1;
    const rawVideoRel = scene.videoUrl || DEFAULT_NEXO_VIDEOS[i % DEFAULT_NEXO_VIDEOS.length];
    const rawVideoPath = path.resolve(baseDir, rawVideoRel.startsWith('/') ? rawVideoRel.slice(1) : rawVideoRel);
    const isFemale = /elena|sofia|fundadora|mujer|female|chica|ana|maria|laura/i.test(scene.character || '');
    const sceneVoice = scene.voice_id || (isFemale ? 'fundadora_pro' : (voiceId || 'ejecutivo_latino'));

    const audioPath = path.join(workDir, `scene_${sceneNum}_audio.mp3`);
    await generateSceneAudio(scene.dialogue, sceneVoice, audioPath);
    const audioDur = await getAudioDuration(audioPath, ffmpegBin);
    const targetDur = Math.max(audioDur + 0.6, 4.0);

    const assPath = path.join(workDir, `scene_${sceneNum}.ass`);
    generateAssSubtitle(scene.character, scene.dialogue, targetDur, assPath);

    const sceneOut = path.join(workDir, `scene_${sceneNum}_rendered.mp4`);
    const escapedAss = assPath.replace(/\\/g, '/').replace(':', '\\:');
    const filter = `crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos,subtitles='${escapedAss}'`;

    const cmd = `"${ffmpegBin}" -y -stream_loop -1 -i "${rawVideoPath}" -i "${audioPath}" -t ${targetDur} -vf "${filter}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -pix_fmt yuv420p "${sceneOut}"`;
    await execPromise(cmd);

    processedScenePaths.push(sceneOut);
    updatedScenes.push({
      ...scene,
      duration_seconds: Math.round(targetDur),
      videoUrl: `/videos/${path.basename(rawVideoPath)}`,
    });
  }

  const concatTxt = path.join(workDir, 'concat_list.txt');
  const concatContent = processedScenePaths.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatTxt, concatContent);

  const finalMasterPath = path.join(publicVideosDir, 'dramaflow_active_minidrama_1080p.mp4');
  const voiceMasterPath = path.join(publicVideosDir, `dramaflow_${voiceId}_1080p.mp4`);

  const concatCmd = `"${ffmpegBin}" -y -f concat -safe 0 -i "${concatTxt}" -c copy "${finalMasterPath}"`;
  await execPromise(concatCmd);

  try {
    fs.copyFileSync(finalMasterPath, voiceMasterPath);
  } catch (e) {}

  return {
    masterVideoPath: finalMasterPath,
    masterVideoUrl: '/videos/dramaflow_active_minidrama_1080p.mp4',
    scenes: updatedScenes,
  };
}
