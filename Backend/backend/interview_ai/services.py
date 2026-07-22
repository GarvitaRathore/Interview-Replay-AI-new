import os
import json
from google import genai
client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
def generate_questions(
        interview_type,
        experience,
        topic,
        difficulty,
        number_of_questions
):
    prompt=f"""Generate {number_of_questions} interview questions.
    Interview Type: {interview_type}
    Experience Level :{experience}
    Topic : {topic}
    Difficulty :{difficulty}
    Return only valid JSON.
    Example:
    [ {{
        "question":"...",
        "expected_answer":"...",
        "category" :"..."
    }}
    ]
    do not return markdown
    do not return explanation
    """
   
    response=client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text=response.text.strip()
    text=text.replace("```json","")
    text=text.replace("```","")
    questions=json.loads(text)
    return questions