const { GoogleGenAI }= require('@google/genai') ;

const ai = new GoogleGenAI({});

async function generateContent(chatHistory) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: chatHistory,
    config:{
        systemInstruction:`
        code give me in 1-2 line with emoji`
    }
  });
  return response.text
}

module.exports = generateContent;