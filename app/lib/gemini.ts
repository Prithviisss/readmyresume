/**
 * Google Gemini API integration for resume analysis
 * Uses the free tier with 60 requests per minute limit
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Validate that Google Gemini API key is configured
 */
export const validateGeminiSetup = (): boolean => {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured');
    return false;
  }
  return true;
};

/**
 * Get API key status for debugging
 */
export const getGeminiStatus = () => ({
  configured: !!GEMINI_API_KEY,
  model: 'gemini-1.5-flash',
  apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
});

export async function analyzeResumeWithGemini(
  resumeText: string,
  prompt: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Google Gemini API key is required. Set VITE_GEMINI_API_KEY in .env file');
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text is empty');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${prompt}\n\nResume Content:\n${resumeText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401) {
        throw new Error('Invalid Google Gemini API key. Please check your credentials.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 400) {
        throw new Error(
          `Invalid request format: ${errorMessage}. Please check your resume content.`
        );
      } else {
        throw new Error(`Google Gemini API error: ${errorMessage}`);
      }
    }

    const data = await response.json();

    // Extract text from Gemini response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Google Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;

    if (!responseText) {
      throw new Error('No analysis text received from Google Gemini API');
    }

    return responseText;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Analysis request timed out after 60 seconds. Please try again.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to analyze resume with Google Gemini API');
  }
}
