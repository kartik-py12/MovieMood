const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export the model
module.exports = {
  getGeminiModel: () => genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" })
};
