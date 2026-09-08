import os
from dotenv import load_dotenv

# Cargar variables de entorno locales
load_dotenv()

from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI

# Configuración del LLM
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=api_key
)

# 1. Agente Guionista (Foco en Retención)
guionista = Agent(
    role='Estratega de Minidramas Virales',
    goal='Escribir un guion de 60 segundos con un gancho disruptivo en los primeros 3 segundos y alta retención.',
    backstory='Eres un experto en retención. Escribes diálogos rápidos, tensos y directos al punto, marcando cues visuales y de audio claros.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 2. Agente Director de Arte (Foco Visual y Emocional)
director_arte = Agent(
    role='Director Cinematográfico y de Actores',
    goal='Tomar el guion y asignar encuadres de cámara, iluminación y la etiqueta emocional exacta para cada línea de diálogo.',
    backstory='Eres un director detallista. Aseguras que los modelos de video y motores TTS reciban las instrucciones técnicas perfectas para cada escena.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 3. Agente de Ritmo y Foley (Foco en Edición)
editor_foley = Agent(
    role='Editor de Ritmo y Diseñador de Sonido',
    goal='Definir los timestamps teóricos para cortes de cámara, silencios tensos y la inserción de efectos de sonido.',
    backstory='Eres un maestro del montaje. Defines el ritmo exacto de la retención visual.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def generar_minidrama(tema: str, nicho: str):
    """
    Orquestación secuencial de 3 agentes cinematográficos para generar
    guion, dirección de arte, y timestamps de ritmo/foley para TikTok / Reels.
    """
    tarea_guion = Task(
        description=f'Escribir un guion sobre {tema} para el nicho de {nicho}.',
        expected_output='Un guion formateado escena por escena con diálogos.',
        agent=guionista
    )

    tarea_direccion = Task(
        description='Asignar metadatos visuales, encuadres y etiquetas emocionales de voz al guion generado.',
        expected_output='Un JSON con las escenas, diálogos, estado emocional y prompt visual para cada frame.',
        agent=director_arte
    )

    tarea_edicion = Task(
        description='Añadir marcadores de SFX y cortes de ritmo al JSON del director.',
        expected_output='Un JSON final enriquecido con timestamps teóricos y pistas de audio/SFX listos para el renderizado.',
        agent=editor_foley
    )

    crew = Crew(
        agents=[guionista, director_arte, editor_foley],
        tasks=[tarea_guion, tarea_direccion, tarea_edicion],
        process=Process.sequential
    )

    return crew.kickoff()

if __name__ == "__main__":
    import sys
    tema_input = sys.argv[1] if len(sys.argv) > 1 else "Conflicto entre socios por robo de startup"
    nicho_input = sys.argv[2] if len(sys.argv) > 2 else "Emprendimiento SaaS B2B"
    print(f"🎬 Iniciando generación de minidrama con CrewAI...")
    resultado = generar_minidrama(tema=tema_input, nicho=nicho_input)
    print(resultado)
