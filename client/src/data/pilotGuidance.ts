import { PilotRole, GuidanceContent } from '@adoption/shared';

export const PILOT_GUIDANCE: Record<PilotRole, GuidanceContent> = {
  PILOT_BUILDER: {
    title: 'Builder guidance',
    description: 'As a Builder, you are responsible for configuring the pilot and maintaining its structural integrity.',
    actions: [
      'Configure pilot scope and domain boundaries',
      'Confirm Spec Freeze before transitioning to Phase 2',
      'Review metrics and deviation trends',
      'Identify structural integrity issues',
    ],
    tips: [
      'Use the Configure Pilot button to set up initial pilot scope',
      'Monitor deviations closely after Spec Freeze is confirmed',
    ],
  },
  PILOT_SME: {
    title: 'Subject Matter Expert guidance',
    description: 'As an SME, you provide domain expertise and feedback on pilot outcomes.',
    actions: [
      'Provide feedback inputs on metrics',
      'Review prototype outcomes',
      'Add contextual notes to metric entries',
      'Share domain insights with the delivery team',
    ],
    tips: [
      'Use the Add Metric Entry button to record observations',
      'Contextual notes help explain variations in metric trends',
    ],
  },
  PILOT_DELIVERY_LEAD: {
    title: 'Delivery Lead guidance',
    description: 'As a Delivery Lead, you manage pilot phases and ensure complete metric coverage.',
    actions: [
      'Manage pilot phase transitions',
      'Ensure metric entry coverage across all dimensions',
      'Use filters to identify gaps',
      'Review completeness indicators',
    ],
    tips: [
      'Check the completeness score to see which metrics are missing',
      'Use phase and loop filters to drill into specific iterations',
    ],
  },
  PILOT_OBSERVER: {
    title: 'Observer guidance',
    description: 'As an Observer, you have read-only access to monitor pilot progress.',
    actions: [
      'View metric summaries and trends',
      'Interpret summary cards',
      'Use filters to explore pilot progress',
      'Track deviations from the baseline',
    ],
    tips: [
      'Use date range filters to focus on specific time periods',
      'Trend tables show how metrics change over time',
    ],
  },
};
