import { store } from '../db/store.js';

// AI Safety screening pipeline
export function screenContent(text, title = "") {
  const combined = `${title} ${text}`.toLowerCase();

  const selfHarmPatterns = [/kill myself/i, /end my life/i, /suicide/i];
  const highRiskHate = [/slur/i, /death threat/i];

  for (const pattern of selfHarmPatterns) {
    if (pattern.test(combined)) {
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "HIGH_RISK_FLAG_SUPPORT_RESOURCES",
        actor: "AI_SCREENING_SERVICE",
        targetText: text.substring(0, 80),
        rationale: "Self-harm signal detected. Held for review; supportive resources surfaced."
      });

      return {
        decision: "RESTRICT_AND_HOLD",
        riskLevel: "HIGH",
        supportNotice: "If you are having a difficult moment, free and confidential support is available 24/7. Call or text 988.",
        allowed: false
      };
    }
  }

  for (const pattern of highRiskHate) {
    if (pattern.test(combined)) {
      return {
        decision: "RESTRICT_AND_HOLD",
        riskLevel: "HIGH",
        reason: "Content violates community safety guidelines.",
        allowed: false
      };
    }
  }

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "CONTENT_PUBLISHED_LOW_RISK",
    actor: "AI_SCREENING_SERVICE",
    targetText: text.substring(0, 60),
    rationale: "Safe peer support tone."
  });

  return {
    decision: "PUBLISH",
    riskLevel: "LOW",
    allowed: true
  };
}
