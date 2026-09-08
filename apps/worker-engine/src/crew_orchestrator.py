import os
from dotenv import load_dotenv

load_dotenv()

from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=api_key
)

guionista = Agent(
    role='Estratega de Minidramas Virales',
    goal='Escribir un guion de 60 segundos con un gancho disruptivo en los primeros 3 segundos y alta retención.',
    backstory='Eres un experto en retención. Escribes diálogos rápidos, tensos y directos al punto, marcando cues visuales y de audio claros.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

director_arte = Agent(
    role='Director Cinematográfico y de Actores',
    goal='Tomar el guion y asignar encuadres de cámara, iluminación y la etiqueta emocional exacta para cada línea de diálogo.',
    backstory='Eres un director detallista. Aseguras que los modelos de video y motores TTS reciban las instrucciones técnicas perfectas para cada escena.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

editor_foley = Agent(
    role='Editor de Ritmo y Diseñador de Sonido',
    goal='Definir los timestamps teóricos para cortes de cámara, silencios tensos y la inserción de efectos de sonido.',
    backstory='Eres un maestro del montaje. Defines el ritmo exacto de la retención visual.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def generar_minidrama(tema: str, nicho: str):
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
