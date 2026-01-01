/* eslint-disable max-len */
// functions/index.js

const functions = require("firebase-functions");
const {GoogleGenerativeAI} = require("@google/generative-ai");

let genAI;
let model;

exports.askGemini = functions.https.onCall(async (data, context) => {
  console.log("Function triggered. Initializing...");

  try {
    if (!genAI) {
      console.log("Attempting to get API key from environment...");

      // Accessing the key from Firebase config (must be lowercase)
      const geminiKey = functions.config().gemini.key;

      if (!geminiKey) {
        console.error("Gemini API Key is NOT FOUND in functions config.");
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The Gemini API Key is missing on the server.",
        );
      }

      console.log("API Key found. Initializing GoogleGenerativeAI client.");
      genAI = new GoogleGenerativeAI(geminiKey);
      model = genAI.getGenerativeModel({model: "gemini-pro"});
      console.log("AI Model initialized successfully.");
    }

    const userMessage = data.message;
    if (!userMessage) {
      console.error("Request failed: User message was empty.");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "The message cannot be empty.",
      );
    }

    console.log(`Received message: "${userMessage}"`);

    const prompt = `
      You are a friendly and helpful ICT tutor for Sri Lankan students. 
      Your name is "ICT Aiya". Your purpose is to explain computer science topics
      (like ERDs, programming, computer hardware) clearly and simply for O/L and A/L students.
      Use simple language and examples they can relate to.

      Student's question: "${userMessage}"
    `;

    console.log("Generating content from Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Successfully received response from Gemini.");

    return {response: text};
  } catch (error) {
    console.error("A critical error occurred in the function:", error);

    throw new functions.https.HttpsError(
        "internal",
        `AI Service Error: ${error.message}`,
    );
  }
});
