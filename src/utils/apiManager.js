// Implement API alternatives for when Gemini API is unavailable

export const alternativeApis = {
  // Function to use OpenAI API as an alternative
  // Note: You would need to set up an OpenAI account and API key
  async useOpenAI(prompt) {
    // This is a placeholder implementation - you would need to add OpenAI SDK
    try {
      // Example implementation with fetch:
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You are a helpful movie recommendation assistant."},
            {role: "user", content: prompt}
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      return null;
    }
  },
  
  // Function to use HuggingFace API as an alternative
  async useHuggingFace(prompt) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'YOUR_HUGGINGFACE_API_KEY'}`
        },
        body: JSON.stringify({ inputs: prompt })
      });
      
      const data = await response.json();
      return data.generated_text;
    } catch (error) {
      console.error("HuggingFace API error:", error);
      return null;
    }
  },
  
  // Local model alternative (if you integrate a local model like Ollama)
  async useLocalModel(prompt) {
    try {
      // Example implementation - would need actual local model setup
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          prompt: prompt,
          stream: false
        })
      });
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Local model error:", error);
      return null;
    }
  }
};

// Function to try multiple APIs in sequence until one works
export async function tryMultipleApis(prompt) {
  // Try OpenAI first
  const openAIResponse = await alternativeApis.useOpenAI(prompt);
  if (openAIResponse) return { text: openAIResponse, source: "openai" };
  
  // Try HuggingFace next
  const huggingFaceResponse = await alternativeApis.useHuggingFace(prompt);
  if (huggingFaceResponse) return { text: huggingFaceResponse, source: "huggingface" };
  
  // Try local model last
  const localModelResponse = await alternativeApis.useLocalModel(prompt);
  if (localModelResponse) return { text: localModelResponse, source: "local-model" };
  
  // If all fail, return null
  return null;
}
