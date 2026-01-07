import { GoogleGenerativeAI } from "@google/generative-ai";

export const onRequestPost = async (context) => {
    try {
        const apiKey = context.env.GEMINI_API_KEY || context.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const { originalLatex, analysis, jobDescription } = await context.request.json();

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text
            .replace(/```latex\n?/g, "")
            .replace(/```tex\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        return Response.json({ optimizedLatex: text });
    } catch (error) {
        console.error("Error optimizing resume:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
};
