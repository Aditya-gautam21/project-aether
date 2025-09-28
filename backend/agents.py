from llama_cpp import Llama
from langchain.agents import initialize_agent, AgentType, Tool
from langchain_community.llms import LlamaCpp
from tools import book_appointment, get_events
import os
from dotenv import load_dotenv

load_dotenv()

llm = LlamaCpp(
    model_path=r"C:\Users\ASUS\models\Llama-3.2-3B-Instruct",
    n_gpu_layers=-1,
    n_batch=32,
    temperature=0.3,
    max_tokens=256,
    verbose=True
)

tools= [
    Tool(
        name='BookAppointment',
        func=book_appointment,
        description="Books an appointment. input: dict with summary"
    ),
    Tool(
        name="GetEvents",
        func=get_events,
        description="Gets events for a date"
    )
]

agent = initialize_agent(tools,
                          llm,
                          agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
                          verbose=True,
                          handle_parsing_errirs=True)

if __name__ == "__main__":
    result = agent.run("Book a test meeting tomorrow at 3 PM with bob@example.com")
    print(result)
