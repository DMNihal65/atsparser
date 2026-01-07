const API_BASE = '/api/ai';

export const analyzeResume = async (resumeContent, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeContent, jobDescription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze resume');
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const optimizeResume = async (originalLatex, analysis, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalLatex, analysis, jobDescription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to optimize resume');
    }

    const data = await response.json();
    return data.optimizedLatex;
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw error;
  }
};
