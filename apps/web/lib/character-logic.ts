/**
 * Character DNA and Visual Logic Guard System for DramaFlow
 * Ensures 100% logical, congruent, non-hallucinating, hyperrealistic character generation across scenes.
 */

export interface CharacterDNA {
  id: string;
  nameMatch: string[];
  displayName: string;
  gender: 'male' | 'female';
  ageRange: string;
  role: string;
  wardrobe: string;
  physicalTraits: string;
  defaultImageUrl: string;
  styleKeywords: string;
  voiceProfile: string;
}

export const CHARACTER_DNA_REGISTRY: Record<string, CharacterDNA> = {
  marcos: {
    id: 'marcos',
    nameMatch: ['marcos', 'marco', 'directivo', 'gerente', 'executive', 'jefe', 'antagonista', 'hombre'],
    displayName: 'Marcos (Directivo)',
    gender: 'male',
    ageRange: '38-42 years old',
    role: 'Corporate Executive / Skeptical Antagonist',
    wardrobe: 'tailored charcoal Italian suit, crisp white dress shirt, luxury wristwatch',
    physicalTraits: '39-year-old handsome caucasian businessman, short neat dark hair, clean shaven with sharp jawline, intense piercing hazel eyes, commanding posture',
    defaultImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'photorealistic portrait, 85mm f/1.4 lens, natural skin texture, subsurface scattering, ARRI Alexa LF cinematic lighting, 8k uhd',
    voiceProfile: 'executive_male',
  },
  elena: {
    id: 'elena',
    nameMatch: ['elena', 'fundadora', 'founder', 'emprendedora', 'protagonista'],
    displayName: 'Elena (Fundadora)',
    gender: 'female',
    ageRange: '28-32 years old',
    role: 'Tech Founder / Visionary Protagonist',
    wardrobe: 'modern minimalist cream tailored blazer over silk top, subtle silver earrings',
    physicalTraits: '30-year-old charismatic intelligent female founder, elegant styled brunette hair, sharp confident expressive gaze, inspiring posture',
    defaultImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'hyperrealistic portrait, natural skin pores, soft rim lighting, shallow depth of field, 8k 9:16 vertical cinematography',
    voiceProfile: 'founder_female',
  },
  david: {
    id: 'david',
    nameMatch: ['david', 'inversor', 'vc', 'inversor_vc', 'socio_senior'],
    displayName: 'David (Inversor VC)',
    gender: 'male',
    ageRange: '45-49 years old',
    role: 'Senior VC Investor / Real Estate Broker',
    wardrobe: 'bespoke navy three-piece suit with pocket square, premium silver watch',
    physicalTraits: '47-year-old distinguished caucasian investor, subtle silver hair at temples, confident authoritative expression',
    defaultImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'photorealistic executive portrait, luxury penthouse background, dramatic high-contrast lighting, Hasselblad H6D-100c',
    voiceProfile: 'investor_male',
  },
  sofia: {
    id: 'sofia',
    nameMatch: ['sofia', 'ingeniera', 'desarrolladora', 'tech_lead', 'especialista'],
    displayName: 'Sofía (Ingeniera)',
    gender: 'female',
    ageRange: '26-29 years old',
    role: 'Lead AI Engineer / Specialist',
    wardrobe: 'dark tech hoodie over minimalist white shirt, smart sleek glasses',
    physicalTraits: '27-year-old focused female AI engineer, intelligent confident look, subtle glowing neon reflections on face',
    defaultImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'photorealistic specialist portrait, cyber lab volumetric lighting, ultra-sharp detail, 8k',
    voiceProfile: 'innovator_female',
  },
  lucia: {
    id: 'lucia',
    nameMatch: ['lucia', 'emprendedora_esp', 'disenadora', 'realtor'],
    displayName: 'Lucía (Emprendedora)',
    gender: 'female',
    ageRange: '29-33 years old',
    role: 'Real Estate Entrepreneur / Architect',
    wardrobe: 'chic charcoal modern coat, stylish tortoiseshell glasses, elegant scarf',
    physicalTraits: '31-year-old expressive female entrepreneur, dark brown wavy hair, warm determined smile',
    defaultImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'photorealistic portrait, contemporary glass architecture background, golden hour natural rim lighting, 8k',
    voiceProfile: 'spanish_female',
  },
  carlos: {
    id: 'carlos',
    nameMatch: ['carlos', 'gerente', 'gerente_esp', 'director_comercial'],
    displayName: 'Carlos (Gerente)',
    gender: 'male',
    ageRange: '40-44 years old',
    role: 'Commercial Director / Strategic Negotiator',
    wardrobe: 'dark grey modern blazer, open-collar sky blue shirt, leather strap watch',
    physicalTraits: '42-year-old charismatic male executive, trimmed beard, engaging intense gaze',
    defaultImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1080&h=1920&fit=crop&q=80',
    styleKeywords: 'photorealistic editorial portrait, modern boardroom bokeh, studio softbox lighting, 8k',
    voiceProfile: 'spanish_male',
  }
};

/**
 * Detects the correct Character DNA by name or role keywords
 */
export function resolveCharacterDNA(name: string, role?: string): CharacterDNA {
  const query = `${name} ${role || ''}`.toLowerCase();
  
  for (const key of Object.keys(CHARACTER_DNA_REGISTRY)) {
    const dna = CHARACTER_DNA_REGISTRY[key];
    if (dna.nameMatch.some(match => query.includes(match))) {
      return dna;
    }
  }

  // If name appears to be male or fallback
  const isMaleGuess = /marcos|carlos|david|juan|mateo|lucas|pablo|diego|hombre|senor|sr|directivo|inversor/i.test(name);
  return isMaleGuess ? CHARACTER_DNA_REGISTRY.marcos : CHARACTER_DNA_REGISTRY.elena;
}

/**
 * Builds a strict, coherent, hallucination-free 9:16 prompt
 */
export function buildConsistentVisualPrompt(
  characterName: string,
  sceneContext: string,
  userCustomInstruction: string = '',
  sceneNumber: number = 1
): { prompt: string; dna: CharacterDNA; fallbackImageUrl: string } {
  const dna = resolveCharacterDNA(characterName);

  // Emotional tone based on scene progression
  const emotionProgression = [
    'tense aggressive confrontation, furrowed brows, demanding authority',
    'shocked disbelief, wide eyes looking at real-time proof',
    'astonished realization, mouth slightly open, turning towards camera',
    'victorious proud smile, visionary confidence, standing tall'
  ];
  const sceneEmotion = emotionProgression[Math.min(sceneNumber - 1, emotionProgression.length - 1)];

  // Strict gender-locking phrases to avoid AI model gender hallucinations
  const genderLock = dna.gender === 'male'
    ? 'ONE SINGLE MAN, 1man, male subject only, adult male, NO WOMEN, NO FEMALES'
    : 'ONE SINGLE WOMAN, 1woman, female subject only, adult female, NO MEN, NO MALES';

  const userRefinement = userCustomInstruction.trim() 
    ? `, user custom direction: ${userCustomInstruction}` 
    : '';

  const prompt = `Cinematic vertical 9:16 portrait of ${dna.physicalTraits}, ${genderLock}, wearing ${dna.wardrobe}, ${sceneEmotion}, setting: ${sceneContext}${userRefinement}, ${dna.styleKeywords}, ultra sharp focus on facial expression, photorealistic movie still, ARRI Alexa LF, Kodak Vision3 500T, volumetric lighting, 8k resolution`;

  return {
    prompt,
    dna,
    fallbackImageUrl: dna.defaultImageUrl
  };
}
