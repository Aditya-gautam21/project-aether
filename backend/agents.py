from langchain.agents import initialize_agent, AgentType
from langchain_community.llms import LlamaCpp
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

llm = LlamaCpp(
    model_path=r"C:\Users\ASUS\models\Llama-3.2-3B-Instruct-f16.gguf",
    n_gpu_layers=20,
    n_batch=32,
    temperature=0.3,
    max_tokens=512,  # Increased for better responses
    verbose=True,
    mmap=False
)

def automate_task(command: str) -> str:
    """Main agent function that processes user commands and executes appropriate tools."""
    try:
        from tools import book_appointment, get_events, create_task, get_tasks

        tools = [book_appointment, get_events, create_task, get_tasks]

        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            max_iterations=5,
            early_stopping_method="generate",
            handle_parsing_errors=True
        )
        
        logger.info(f"Processing command: {command}")
        result = agent.run(command)
        logger.info(f"Command completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error in automate_task: {str(e)}")
        return f"I encountered an error while processing your request: {str(e)}. Please try rephrasing your command."

if __name__ == "__main__":
    test_command = "Book a team meeting on 2025-10-02 from 2PM to 3PM with example@email.com"
    print(automate_task(test_command))
