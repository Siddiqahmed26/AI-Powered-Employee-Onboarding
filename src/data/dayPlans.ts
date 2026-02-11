export interface TaskTemplate {
  id: string;
  title: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

type DayPlanMap = Record<number, TaskTemplate[]>;

const genericDays: DayPlanMap = {
  1: [
    { id: '1-1', title: 'Complete HR paperwork & compliance forms', duration: '1 hour', priority: 'high' },
    { id: '1-2', title: 'Get ID badge and building access', duration: '30 min', priority: 'high' },
    { id: '1-3', title: 'Meet your team lead & buddy', duration: '30 min', priority: 'medium' },
    { id: '1-4', title: 'Review employee handbook', duration: '1 hour', priority: 'medium' },
  ],
  6: [
    { id: '6-1', title: 'Attend 1:1 with manager', duration: '30 min', priority: 'high' },
    { id: '6-2', title: 'Document learnings so far', duration: '1 hour', priority: 'medium' },
    { id: '6-3', title: 'Cross-team collaboration session', duration: '1 hour', priority: 'medium' },
  ],
  7: [
    { id: '7-1', title: 'Present Week 1 summary to team', duration: '30 min', priority: 'high' },
    { id: '7-2', title: 'Set goals for Week 2', duration: '1 hour', priority: 'high' },
    { id: '7-3', title: 'Feedback session with manager', duration: '30 min', priority: 'medium' },
  ],
};

const departmentPlans: Record<string, Partial<DayPlanMap>> = {
  Engineering: {
    2: [
      { id: '2-1', title: 'Set up development environment & tools', duration: '2 hours', priority: 'high' },
      { id: '2-2', title: 'Complete security & code-of-conduct training', duration: '1 hour', priority: 'high' },
      { id: '2-3', title: 'Get access to code repositories', duration: '30 min', priority: 'medium' },
    ],
    3: [
      { id: '3-1', title: 'Review codebase architecture docs', duration: '2 hours', priority: 'high' },
      { id: '3-2', title: 'Attend team standup & sprint planning', duration: '1 hour', priority: 'medium' },
      { id: '3-3', title: 'Shadow a senior engineer', duration: '2 hours', priority: 'medium' },
    ],
    4: [
      { id: '4-1', title: 'Pick your first starter task / bug fix', duration: '30 min', priority: 'high' },
      { id: '4-2', title: 'Set up local testing & CI pipeline', duration: '1 hour', priority: 'high' },
      { id: '4-3', title: 'Read code review guidelines', duration: '45 min', priority: 'medium' },
    ],
    5: [
      { id: '5-1', title: 'Complete and submit your first PR', duration: '3 hours', priority: 'high' },
      { id: '5-2', title: 'Pair programming session', duration: '1 hour', priority: 'medium' },
      { id: '5-3', title: 'Review deployment process', duration: '30 min', priority: 'medium' },
    ],
  },
  Product: {
    2: [
      { id: '2-1', title: 'Review product roadmap & strategy docs', duration: '2 hours', priority: 'high' },
      { id: '2-2', title: 'Set up analytics & project management tools', duration: '1 hour', priority: 'high' },
      { id: '2-3', title: 'Meet with key stakeholders', duration: '1 hour', priority: 'medium' },
    ],
    3: [
      { id: '3-1', title: 'Analyze current product metrics', duration: '2 hours', priority: 'high' },
      { id: '3-2', title: 'Review user research & feedback', duration: '1 hour', priority: 'medium' },
      { id: '3-3', title: 'Shadow product team meeting', duration: '1 hour', priority: 'medium' },
    ],
    4: [
      { id: '4-1', title: 'Draft your first feature spec', duration: '2 hours', priority: 'high' },
      { id: '4-2', title: 'Learn the backlog grooming process', duration: '1 hour', priority: 'medium' },
      { id: '4-3', title: 'Meet with engineering team lead', duration: '30 min', priority: 'medium' },
    ],
    5: [
      { id: '5-1', title: 'Present feature spec for feedback', duration: '1 hour', priority: 'high' },
      { id: '5-2', title: 'Conduct a competitive analysis', duration: '2 hours', priority: 'medium' },
      { id: '5-3', title: 'Prioritize backlog items', duration: '1 hour', priority: 'medium' },
    ],
  },
  Design: {
    2: [
      { id: '2-1', title: 'Review design system & brand guidelines', duration: '2 hours', priority: 'high' },
      { id: '2-2', title: 'Set up Figma / design tools', duration: '1 hour', priority: 'high' },
      { id: '2-3', title: 'Meet with design team lead', duration: '30 min', priority: 'medium' },
    ],
    3: [
      { id: '3-1', title: 'Audit existing UI patterns', duration: '2 hours', priority: 'high' },
      { id: '3-2', title: 'Review current design projects', duration: '1 hour', priority: 'medium' },
      { id: '3-3', title: 'Shadow a design critique session', duration: '1 hour', priority: 'medium' },
    ],
    4: [
      { id: '4-1', title: 'Work on a starter design task', duration: '3 hours', priority: 'high' },
      { id: '4-2', title: 'Learn the design handoff process', duration: '1 hour', priority: 'medium' },
    ],
    5: [
      { id: '5-1', title: 'Present designs for feedback', duration: '1 hour', priority: 'high' },
      { id: '5-2', title: 'Collaborate with engineering on implementation', duration: '2 hours', priority: 'medium' },
    ],
  },
  Marketing: {
    2: [
      { id: '2-1', title: 'Review marketing strategy & campaigns', duration: '2 hours', priority: 'high' },
      { id: '2-2', title: 'Set up marketing tools & dashboards', duration: '1 hour', priority: 'high' },
      { id: '2-3', title: 'Meet with content & growth teams', duration: '1 hour', priority: 'medium' },
    ],
    3: [
      { id: '3-1', title: 'Analyze current campaign performance', duration: '2 hours', priority: 'high' },
      { id: '3-2', title: 'Review brand voice guidelines', duration: '1 hour', priority: 'medium' },
      { id: '3-3', title: 'Shadow a campaign planning session', duration: '1 hour', priority: 'medium' },
    ],
    4: [
      { id: '4-1', title: 'Draft your first content piece', duration: '2 hours', priority: 'high' },
      { id: '4-2', title: 'Learn the content approval workflow', duration: '30 min', priority: 'medium' },
    ],
    5: [
      { id: '5-1', title: 'Submit content for review', duration: '1 hour', priority: 'high' },
      { id: '5-2', title: 'Plan a small campaign or initiative', duration: '2 hours', priority: 'medium' },
    ],
  },
  Sales: {
    2: [
      { id: '2-1', title: 'Review sales playbook & CRM setup', duration: '2 hours', priority: 'high' },
      { id: '2-2', title: 'Complete product knowledge training', duration: '1 hour', priority: 'high' },
      { id: '2-3', title: 'Meet with sales manager', duration: '30 min', priority: 'medium' },
    ],
    3: [
      { id: '3-1', title: 'Shadow sales calls', duration: '3 hours', priority: 'high' },
      { id: '3-2', title: 'Review pipeline & key accounts', duration: '1 hour', priority: 'medium' },
    ],
    4: [
      { id: '4-1', title: 'Make your first prospect outreach', duration: '2 hours', priority: 'high' },
      { id: '4-2', title: 'Practice pitch & objection handling', duration: '1 hour', priority: 'medium' },
    ],
    5: [
      { id: '5-1', title: 'Conduct first solo demo/call', duration: '1 hour', priority: 'high' },
      { id: '5-2', title: 'Debrief with mentor', duration: '30 min', priority: 'medium' },
    ],
  },
};

// Fallback for departments without specific plans
const defaultMidWeek: Partial<DayPlanMap> = {
  2: [
    { id: '2-1', title: 'Complete department-specific training', duration: '2 hours', priority: 'high' },
    { id: '2-2', title: 'Set up work tools & access', duration: '1 hour', priority: 'high' },
    { id: '2-3', title: 'Review department documentation', duration: '1 hour', priority: 'medium' },
  ],
  3: [
    { id: '3-1', title: 'Shadow a senior team member', duration: '2 hours', priority: 'high' },
    { id: '3-2', title: 'Attend team meeting', duration: '1 hour', priority: 'medium' },
    { id: '3-3', title: 'Review current projects', duration: '1 hour', priority: 'medium' },
  ],
  4: [
    { id: '4-1', title: 'Take on your first small task', duration: '2 hours', priority: 'high' },
    { id: '4-2', title: 'Learn team processes & workflows', duration: '1 hour', priority: 'medium' },
  ],
  5: [
    { id: '5-1', title: 'Complete first deliverable', duration: '3 hours', priority: 'high' },
    { id: '5-2', title: 'Get feedback from team lead', duration: '30 min', priority: 'medium' },
  ],
};

export function getDayPlan(department: string, day: number): TaskTemplate[] {
  // Days 1, 6, 7 are generic for everyone
  if (genericDays[day]) return genericDays[day];

  const deptPlan = departmentPlans[department];
  if (deptPlan && deptPlan[day]) return deptPlan[day]!;

  return defaultMidWeek[day] || [];
}
