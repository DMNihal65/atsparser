import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeResume = async (resumeContent, jobDescription) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean up markdown code blocks if present
    const jsonString = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const optimizeResume = async (originalLatex, analysis, jobDescription) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert LaTeX resume editor. I will provide you with:
1. The original LaTeX resume code
2. Analysis results with optimization suggestions
3. The target job description

Your task is to update ONLY the content of the resume while preserving ALL LaTeX syntax, commands, and formatting.

CRITICAL RULES:
- DO NOT change any LaTeX commands, environments, or syntax
- DO NOT add new LaTeX packages or commands
- DO NOT change the document structure or layout
- DO NOT remove any LaTeX environments or formatting
- ONLY update the text content inside the existing structure
- Preserve all formatting, spacing, and layout exactly
- Add missing keywords naturally within existing sections
- Improve bullet points to be more impactful and ATS-friendly
- Quantify achievements where possible
- Make content more relevant to the target job

ORIGINAL LATEX RESUME:
${originalLatex}

TARGET JOB DESCRIPTION:
${jobDescription}

ANALYSIS AND OPTIMIZATION SUGGESTIONS:
${JSON.stringify(analysis, null, 2)}

Please return ONLY the updated LaTeX code with the same structure but improved content.
Do not include any explanations, comments, or markdown formatting - just the pure LaTeX code starting with \\documentclass.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Clean up markdown code blocks if present
    text = text
      .replace(/```latex\n?/g, "")
      .replace(/```tex\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return text;
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw error;
  }
};
