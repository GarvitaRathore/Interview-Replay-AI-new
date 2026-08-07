from dotenv import load_dotenv
load_dotenv()
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
        model="gemini-3.5-flash-lite",
        contents=prompt
    )
    text=response.text.strip()
    text=text.replace("```json","")
    text=text.replace("```","")
    questions=json.loads(text)
    return questions
def evaluate_answer(question,expected_answer,user_answer):
    prompt=f"""
    Question:{question},
    Expected Answer:{expected_answer},
    User Answer:{user_answer}
    Return only valid JSON like this:
    {{
     "score" : 85,
     "feedback" : "Good answer, Improve ..." 
    }}
"""
    response=client.models.generate_content(model="gemini-3.5-flash-lite",
                                             contents=prompt  )
    text=response.text.strip()
    text=text.replace("```json","").replace("```","")
    return json.loads(text)
import re
def count_filler_words(text):
    print("Text received:",text)
    fillers=["um","umm","uh","uhh","like","actually","basically","literally","seriously","honestly","you know","i mean","kind of","sort of","okay","ok"]
    total=0;
    text=text.lower()
    for word in fillers:
      count=text.lower().count(word)
      print(word,count)
      total+=count
      print("Total:",total)
    return total
    