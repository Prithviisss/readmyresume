/**
 * Anthropic Claude Integration for Resume Analysis
 * This module handles direct API calls to Anthropic's Claude model
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

interface AnthropicContentBlock {
  type: 'text' | 'image' | 'document';
  text?: string;
  source?: {
    type: 'base64' | 'file';
    media_type?: string;
    data?: string;
    url?: string;
  };
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Convert base64 string to file for Anthropic API
 */
const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Call Anthropic API for resume analysis
 */
export const analyzeResumeWithAnthropic = async (
  resumeText: string,
  prompt: string
): Promise<string | null> => {
  if (!ANTHROPIC_API_KEY) {
    console.error('VITE_ANTHROPIC_API_KEY environment variable is not set');
    throw new Error('Anthropic API key not configured. Please set VITE_ANTHROPIC_API_KEY in .env file');
  }

  try {
    console.log('[Anthropic] Sending resume analysis request...');
    
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nRESUME CONTENT:\n${resumeText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData?.error?.message || `API Error ${response.status}`;
      console.error('[Anthropic] API Error:', errorMsg);
      throw new Error(`Anthropic API Error: ${errorMsg}`);
    }

    const data: AnthropicResponse = await response.json();
    console.log('[Anthropic] Response received successfully');

    const analysisText = data.content[0]?.text;
    if (!analysisText) {
      throw new Error('No text in Anthropic response');
    }

    return analysisText;
  } catch (error: any) {
    console.error('[Anthropic] Error during analysis:', error.message);
    throw error;
  }
};

/**
 * Validate that API key is configured
 */
export const validateAnthropicSetup = (): boolean => {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[Anthropic] API key not configured');
    return false;
  }
  return true;
};

/**
 * Get API key status for debugging
 */
export const getAnthropicStatus = () => ({
  configured: !!ANTHROPIC_API_KEY,
  model: MODEL,
  apiUrl: ANTHROPIC_API_URL,
});
