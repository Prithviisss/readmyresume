import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

export const calculateFitScore = (feedback: Feedback): number => {
  // Weighted calculation for interview likelihood
  const atsWeight = 0.4;
  const skillsWeight = 0.3;
  const contentWeight = 0.2;
  const toneWeight = 0.1;

  const fitScore =
    (feedback.ATS.score * atsWeight +
      feedback.skills.score * skillsWeight +
      feedback.content.score * contentWeight +
      feedback.toneAndStyle.score * toneWeight);

  return Math.round(fitScore);
};

export const extractSkillsFromFeedback = (feedback: Feedback): {
  matched: string[];
  missing: string[];
} => {
  const matched: string[] = [];
  const missing: string[] = [];

  feedback.skills.tips.forEach((tip) => {
    if (tip.type === "good") {
      const skillMatch = tip.tip.match(/(?:strong|great|good)\s+(?:in|with|at)\s+([^.]+)/i);
      if (skillMatch) matched.push(skillMatch[1].trim());
    } else {
      const skillMatch = tip.tip.match(/(?:improve|add|highlight)\s+(?:your\s+)?([^.]+)/i);
      if (skillMatch) missing.push(skillMatch[1].trim());
    }
  });

  return { matched, missing };
};

export const generateFitRecommendations = (feedback: Feedback): string[] => {
  const recommendations: string[] = [];

  // ATS recommendations
  if (feedback.ATS.score < 70) {
    recommendations.push("Optimize keywords to improve ATS score");
  }

  // Skills recommendations
  if (feedback.skills.score < 70) {
    recommendations.push("Highlight more relevant technical skills");
  }

  // Content recommendations
  if (feedback.content.score < 70) {
    recommendations.push("Enhance description of achievements and impact");
  }

  // Structure recommendations
  if (feedback.structure.score < 70) {
    recommendations.push("Reorganize resume sections for better flow");
  }

  // High overall score recommendation
  if (
    feedback.ATS.score > 75 &&
    feedback.skills.score > 75
  ) {
    recommendations.push("Your resume is well-aligned. Consider customizing for role-specific keywords");
  }

  return recommendations;
};

