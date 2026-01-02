/* eslint-disable max-len */

const {onCall} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const functions = require("firebase-functions");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.askGemini = onCall(
    {secrets: [GEMINI_API_KEY]},
    async (request) => {
      try {
        const message = request.data.message;
        if (!message) {
          throw new functions.https.HttpsError(
              "invalid-argument",
              "Message is required",
          );
        }

        const prompt = `
You are ICT Aiya, a friendly ICT tutor for Sri Lankan O/L and A/L students.
Explain concepts clearly with simple examples.

Student question: "${message}"
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${GEMINI_API_KEY.value()}`,
            {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{text: prompt}],
                  },
                ],
              }),
            },
        );

        const data = await response.json();

        if (!data.candidates?.length) {
          throw new Error(JSON.stringify(data));
        }

        return {
          response: data.candidates[0].content.parts[0].text,
        };
      } catch (error) {
        console.error("Gemini REST Error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "AI Service Error: " + error.message,
        );
      }
    },
);
