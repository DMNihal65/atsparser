import { GoogleGenerativeAI } from "@google/generative-ai";

export const onRequestPost = async (context) => {
    try {
        const apiKey = context.env.GEMINI_API_KEY || context.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const { resumeContent, jobDescription } = await context.request.json();

        const prompt = `You are an expert ATS (Applicant Tracking System) analyst and resume optimization specialist.
            
Analyze the LaTeX resume against the job description and provide comprehensive ATS optimization recommendations.

LATEX RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the exact JSON format specified below. Focus on:
1. ATS-friendly formatting and keyword optimization
2. Relevance to the specific job requirements
3. Specific, actionable improvements for each section
4. Keyword matching and density analysis
5. Content that should be added or emphasized

IMPORTANT: Calculate the ATS score based on:
- Keyword match percentage (40% weight)
- Skills alignment (25% weight)
- Experience relevance (20% weight)
- Formatting and structure (15% weight)

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "score": number (0-100),
  "missingKeywords": ["keyword1", "keyword2", ...],
  "presentKeywords": ["keyword1", "keyword2", ...],
  "suggestions": [
    {
      "section": "Section Name",
      "suggestion": "Specific actionable improvement",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "summary": "Brief overall assessment and main recommendations"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonString = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        return Response.json(JSON.parse(jsonString));
    } catch (error) {
        console.error("Error analyzing resume:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
};
