import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

function getFfmpegPath(): string {
  const directPath = 'C:\\Users\\ALAN\\Desktop\\dramaflow-mvp\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe';
  if (fs.existsSync(directPath)) return directPath;
  return 'ffmpeg';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const voiceId = searchParams.get('voiceId') || 'ejecutivo_latino';
  const text = searchParams.get('text') || 'Minidrama en progreso';
  const cleanText = text.replace(/["'\n\r]/g, ' ').trim();

  // 1. Language & Distinct Acoustic Filters for all 4 profiles
  let lang = 'es-ES';
  let audioFilter = 'aresample=44100,volume=1.2';

  if (voiceId === 'ejecutivo_latino') {
    lang = 'es-ES';
    // Deep, authoritative, resonant masculine boardroom voice
    audioFilter = 'asetrate=44100*0.87,aresample=44100,volume=1.3';
  } else if (voiceId === 'fundadora_pro') {
    lang = 'es-US';
    // Bright, modern, persuasive feminine founder voice
    audioFilter = 'asetrate=44100*1.12,aresample=44100,volume=1.15';
  } else if (voiceId === 'narrador_epico') {
    lang = 'es-ES';
    // Deep cinematic trailer narrator with dramatic cadence
    audioFilter = 'asetrate=44100*0.75,aresample=44100,atempo=0.90,volume=1.45';
  } else if (voiceId === 'tiktoker_rapido') {
    lang = 'es-US';
    // High-speed, energetic, viral social media cadence
    audioFilter = 'asetrate=44100*1.04,aresample=44100,atempo=1.28,volume=1.2';
  } else {
    lang = 'es-US';
    audioFilter = 'aresample=44100,volume=1.2';
  }

  // 2. Cache management for instant response
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const cachePrefix = elevenKey ? 'elevenlabs_v2_' : 'ffmpeg_';
  const hash = crypto.createHash('md5').update(`${cachePrefix}_${voiceId}_${cleanText}`).digest('hex');
  const cacheDir = path.join(process.cwd(), 'temp_tts');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cachedFile = path.join(cacheDir, `${hash}.mp3`);

  if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 1000) {
    const buffer = fs.readFileSync(cachedFile);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-DramaFlow-Voice': voiceId,
      },
    });
  }

  // 2.5 ElevenLabs Neural Voice Synthesis if API Key configured in .env
  if (elevenKey) {
    try {
      const voiceMap: Record<string, string> = {
        'ejecutivo_latino': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - Resonant, Authoritative Male
        'fundadora_pro': 'EXAVITQu4vr4xnSDxMaL',    // Sarah - Mature, Confident, Persuasive Female
        'narrador_epico': 'JBFqnCBsd6RMkjVDRZzb',   // George - Warm, Captivating Storyteller
        'tiktoker_rapido': 'TX3LPaxmHKxFdv7VOQHJ',  // Liam - Energetic Social Media Creator
      };
      const elevenVoiceId = voiceMap[voiceId] || 'EXAVITQu4vr4xnSDxMaL';
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
        fs.writeFileSync(cachedFile, audioBuf);
        return new NextResponse(audioBuf, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
            'X-DramaFlow-Voice-Engine': 'ElevenLabs',
          },
        });
      }
    } catch (elErr) {
      console.warn('ElevenLabs API fetch error:', elErr);
    }
  }

  // 3. Synthesize base speech and apply distinct acoustic transformation
  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=${lang}&client=tw-ob`;

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (res.ok) {
      const rawBuf = Buffer.from(await res.arrayBuffer());
      const rawTempFile = path.join(cacheDir, `raw_${hash}.mp3`);
      fs.writeFileSync(rawTempFile, rawBuf);

      const ffmpegBin = getFfmpegPath();
      try {
        const cmd = `"${ffmpegBin}" -y -i "${rawTempFile}" -af "${audioFilter}" "${cachedFile}"`;
        await execPromise(cmd);

        if (fs.existsSync(cachedFile)) {
          const finalBuf = fs.readFileSync(cachedFile);
          try { fs.unlinkSync(rawTempFile); } catch (e) {}
          return new NextResponse(finalBuf, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
              'X-DramaFlow-Voice': voiceId,
            },
          });
        }
      } catch (ffErr) {
        console.warn('FFmpeg audio filter warning, returning raw:', ffErr);
      }

      // If ffmpeg fails, fallback to raw audio
      return new NextResponse(rawBuf, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (err) {
    console.warn('TTS fetch failed:', err);
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/marcos_sample.mp3', req.url));
}
