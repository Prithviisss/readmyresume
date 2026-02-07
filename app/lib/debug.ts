// Debug utilities for AI Resume Analyzer

export const logDebug = (label: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${label}:`, data);
  
  // Also try to log to browser's local storage for persistence
  try {
    const debugLogs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
    debugLogs.push({ timestamp, label, data: data ? JSON.stringify(data).substring(0, 500) : '' });
    // Keep only last 50 logs
    localStorage.setItem('debugLogs', JSON.stringify(debugLogs.slice(-50)));
  } catch (e) {
    console.error('Failed to save debug log:', e);
  }
};

export const generateTestFeedback = (): Feedback => {
  return {
    overallScore: 75,
    ATS: {
      score: 78,
      tips: [
        { type: "good", tip: "Good use of keywords" },
        { type: "improve", tip: "Add more technical skills" }
      ]
    },
    toneAndStyle: {
      score: 80,
      tips: [
        { type: "good", tip: "Professional tone", explanation: "The language is clear and professional" },
        { type: "improve", tip: "Less passive voice", explanation: "Use more active voice for impact" }
      ]
    },
    content: {
      score: 72,
      tips: [
        { type: "good", tip: "Clear achievements", explanation: "Achievements are well documented" },
        { type: "improve", tip: "Quantify results more", explanation: "Add more numbers and metrics" }
      ]
    },
    structure: {
      score: 80,
      tips: [
        { type: "good", tip: "Well organized", explanation: "Sections flow logically" },
        { type: "improve", tip: "Reduce length", explanation: "Keep to 1-2 pages for better readability" }
      ]
    },
    skills: {
      score: 70,
      tips: [
        { type: "good", tip: "Relevant skills listed", explanation: "Skills match job requirements well" },
        { type: "improve", tip: "Highlight technical stack", explanation: "Make technology choices more prominent" }
      ]
    }
  };
};

export const clearDebugLogs = () => {
  try {
    localStorage.removeItem('debugLogs');
    console.log('Debug logs cleared');
  } catch (e) {
    console.error('Failed to clear debug logs:', e);
  }
};

export const getDebugLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('debugLogs') || '[]');
  } catch (e) {
    console.error('Failed to retrieve debug logs:', e);
    return [];
  }
};

export const printDebugLogs = () => {
  const logs = getDebugLogs();
  console.table(logs);
};
