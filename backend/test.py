from langchain_community.llms import LlamaCpp

# Your model path
MODEL_PATH = r"C:\Users\ASUS\models\Llama-3.2-3B-Instruct-f16.gguf"

# Load model with full GPU offload
llm = LlamaCpp(
    model_path=MODEL_PATH,
    n_gpu_layers=-1,  # Offload all layers to GPU (adjust to 20 if VRAM issues)
    verbose=True      # Shows GPU offload details
)

print("Running a simple test prompt...")

# Generate response
response = llm.invoke("Write a short poem about autumn leaves.")

print("Model response:\n", response)
