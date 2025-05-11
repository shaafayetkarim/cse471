// /app/api/gemini-topics/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    const { topic, keywords } = await request.json();
    
    // Input validation
    if (!topic || typeof topic !== 'string') {
      return Response.json(
        { success: false, error: "Valid topic is required" },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Construct the prompt
    let prompt = `Generate exactly 5 engaging, creative, and specific blog post ideas about "${topic}".`;
    
    if (keywords && keywords.trim()) {
      prompt += ` Include these keywords where appropriate: ${keywords}.`;
    }
    
    prompt += ` Format the output as a JSON array of 5 strings, with no additional text or explanation. Each title should be concise but descriptive.`;
    
    console.log("Sending prompt to Gemini:", prompt);
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini:", text);
    
    // Parse the response - handle different possible formats
    let topics = [];
    let extractionFailed = false;
    
    try {
      // First try to parse as JSON
      topics = JSON.parse(text);
      
      // If somehow we get an object instead of array, extract values
      if (!Array.isArray(topics) && typeof topics === 'object') {
        topics = Object.values(topics);
      }
    } catch (err) {
      // If JSON parsing fails, try to extract titles from the text
      console.log("Failed to parse JSON, extracting titles from text");
      topics = text
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
        .slice(2, 7);
    }
    
    // Check if extraction failed or returned insufficient results
    if (!Array.isArray(topics) || topics.length < 1) {
      extractionFailed = true;
      return Response.json({ 
        success: false, 
        error: "Failed to generate topics with the AI model",
        requiresRetry: true
      }, { status: 422 });
    }
    
    // Ensure we have exactly 5 topics by truncating or adding generic ones
    while (topics.length > 5) topics.pop();
    
    // If we have less than 5 topics but at least 1, it's a partial success
    const partialSuccess = topics.length > 0 && topics.length < 5;
    
    if (partialSuccess) {
      return Response.json({ 
        success: true, 
        topics,
        partialSuccess: true,
        message: "Only generated " + topics.length + " topics. You may want to retry for a full set of 5."
      });
    }
    
    return Response.json({ 
      success: true, 
      topics 
    });
  } catch (error) {
    console.error("Error generating topics with Gemini:", error);
    return Response.json(
      { 
        success: false, 
        error: "Failed to generate topics. Please try again.",
        requiresRetry: true
      },
      { status: 500 }
    );
  }
}



