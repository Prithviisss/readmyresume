interface FitScoreProps {
  feedback: Feedback;
  jobTitle?: string;
  companyName?: string;
}

const FitScore = ({ feedback, jobTitle, companyName }: FitScoreProps) => {
  // Calculate interview likelihood based on weighted scores
  const interviewLikelihood = Math.round(
    feedback.ATS.score * 0.4 +
    feedback.skills.score * 0.3 +
    feedback.content.score * 0.2 +
    feedback.toneAndStyle.score * 0.1
  );

  const percentage = interviewLikelihood / 100;

  // Determine likelihood label and color
  const getLikelihoodLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Moderate";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const getLikelihoodColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getGradientColor = (score: number) => {
    if (score >= 85) return "url(#fitGradientGreen)";
    if (score >= 70) return "url(#fitGradientBlue)";
    if (score >= 55) return "url(#fitGradientYellow)";
    if (score >= 40) return "url(#fitGradientOrange)";
    return "url(#fitGradientRed)";
  };

  // Extract matched and missing skills
  const extractedSkills = {
    matched: Array.from(new Set(
      feedback.skills.tips
        .filter((tip) => tip.type === "good")
        .map((tip) => tip.tip)
        .slice(0, 3)
    )),
    missing: Array.from(new Set(
      feedback.skills.tips
        .filter((tip) => tip.type === "improve")
        .map((tip) => tip.tip)
        .slice(0, 3)
    )),
  };

  // Generate recommendations
  const recommendations: string[] = [];
  if (feedback.ATS.score < 70) {
    recommendations.push("Optimize keywords to improve ATS score");
  }
  if (feedback.skills.score < 70) {
    recommendations.push("Highlight more relevant technical skills");
  }
  if (feedback.content.score < 70) {
    recommendations.push("Enhance description of achievements");
  }
  if (interviewLikelihood >= 75) {
    recommendations.push("Your resume is well-matched! Apply with confidence");
  }

  return (
    <div className="resume-card fade-in">
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-2">Interview Likelihood Prediction</h2>
        <p className="text-sm text-muted mb-6">
          {companyName && jobTitle
            ? `AI assessment for ${jobTitle} position at ${companyName}`
            : "AI-powered prediction of interview success"}
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Circular Score Display */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="fitGradientGreen"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="fitGradientBlue"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient
                    id="fitGradientYellow"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="fitGradientOrange"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient
                    id="fitGradientRed"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />

                {/* Foreground circle with animation */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getGradientColor(interviewLikelihood)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 282.74} 282.74`}
                  transform="rotate(-90 50 50)"
                  style={{
                    transition: "stroke-dasharray 0.8s ease-in-out",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-4xl font-bold ${getLikelihoodColor(interviewLikelihood)}`}>
                  {interviewLikelihood}%
                </div>
                <div className={`text-sm font-semibold ${getLikelihoodColor(interviewLikelihood)}`}>
                  {getLikelihoodLabel(interviewLikelihood)}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted text-center max-w-xs">
              Likelihood of getting an interview based on resume fit
            </p>
          </div>

          {/* Details Section */}
          <div className="flex-1">
            {/* Matched Skills */}
            {extractedSkills.matched.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  Matched Skills
                </h3>
                <ul className="space-y-2">
                  {extractedSkills.matched.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills */}
            {extractedSkills.missing.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  Skills to Highlight
                </h3>
                <ul className="space-y-2">
                  {extractedSkills.missing.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-red-600 font-bold mt-0.5">→</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                  AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 font-bold mt-0.5">💡</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitScore;
