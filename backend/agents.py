from langchain.agents import initialize_agent, AgentType, Tool
from langchain_community.llms import LlamaCpp
import os
from dotenv import load_dotenv

load_dotenv()

llm = LlamaCpp(
    model_path=r"C:\Users\ASUS\models\Llama-3.2-3B-Instruct-f16.gguf",
    n_gpu_layers=20,
    n_batch=32,
    temperature=0.3,
    max_tokens=256,
    verbose=True,
    mmap=False
)

def automate_task(command: str) -> str:
    from tools import book_appointment, get_events

    tools = [book_appointment, get_events]

    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent.run(command)

if __name__ == "__main__":
    test_command = "Book a team meeting on 2025-10-02 from 2PM to 3PM with example@email.com"
    print(automate_task(test_command))
