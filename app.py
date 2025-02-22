from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from typing import List, Dict

class PromptRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 1000
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    num_return_sequences: Optional[int] = 1

class PromptResponse(BaseModel):
    generated_text: str
    tokens_used: int

app = FastAPI(
    title="Mistral 7B API",
    description="API for Mistral 7B language model",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    try:
        print("🔄 Loading Mistral 7B model and tokenizer...")
        
        # Check for GPU availability
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")

        # Load model and tokenizer
        model_name = "mistralai/Mistral-7B-Instruct-v0.1"
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto"
        )
        
        print("✅ Model and tokenizer loaded successfully!")
    
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        raise Exception(f"Failed to initialize Mistral model: {str(e)}")

@app.post("/generate/", response_model=PromptResponse)
async def generate_text(request: PromptRequest):
    try:
        # Ensure model is loaded
        if model is None or tokenizer is None:
            raise HTTPException(
                status_code=503,
                detail="Model not initialized"
            )

        # Format the prompt for instruction-based completion
        formatted_prompt = f"""<s>[INST] {request.prompt} [/INST]"""

        # Tokenize input
        inputs = tokenizer(
            formatted_prompt,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(model.device)

        # Generate text
        outputs = model.generate(
            inputs.input_ids,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            num_return_sequences=request.num_return_sequences,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

        # Decode output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        tokens_used = len(outputs[0])

        return PromptResponse(
            generated_text=generated_text,
            tokens_used=tokens_used
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating text: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "gpu_available": torch.cuda.is_available()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)