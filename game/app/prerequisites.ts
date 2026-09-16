export type ProgressionContext = {
  week: number;
  completedCourses: string[];
  finishedBooks: string[];
  skillProgress: Record<string, number>;
  rooms: string[];
  houseLevel: number;
  sociability: number;
  travelCount: number;
  expeditionCount: number;
  completedExpeditions: string[];
  bookProgressMax: number;
  courseProgressMax: number;
};

export type Prerequisite =
  | { kind: 'week'; value: number; label: string }
  | { kind: 'course'; id: string; label: string }
  | { kind: 'book'; id: string; label: string }
  | { kind: 'finishedBooks'; value: number; label: string }
  | { kind: 'bookProgress'; value: number; label: string }
  | { kind: 'courseProgress'; value: number; label: string }
  | { kind: 'skill'; id: string; value: number; label: string }
  | { kind: 'room'; id: string; label: string }
  | { kind: 'houseLevel'; value: number; label: string }
  | { kind: 'social'; value: number; label: string }
  | { kind: 'travel'; value: number; label: string }
  | { kind: 'expedition'; value: number; label: string }
  | { kind: 'expeditionRoute'; id: string; label: string };

export function prerequisiteMet(requirement: Prerequisite, context: ProgressionContext) {
  switch (requirement.kind) {
    case 'week': return context.week >= requirement.value;
    case 'course': return context.completedCourses.includes(requirement.id);
    case 'book': return context.finishedBooks.includes(requirement.id);
    case 'finishedBooks': return context.finishedBooks.length >= requirement.value;
    case 'bookProgress': return context.bookProgressMax >= requirement.value;
    case 'courseProgress': return context.courseProgressMax >= requirement.value;
    case 'skill': return (context.skillProgress[requirement.id] ?? 0) >= requirement.value * 2;
    case 'room': return context.rooms.includes(requirement.id);
    case 'houseLevel': return (context.houseLevel ?? 0) >= requirement.value;
    case 'social': return context.sociability >= requirement.value;
    case 'travel': return context.travelCount >= requirement.value;
    case 'expedition': return (context.expeditionCount ?? 0) >= requirement.value;
    case 'expeditionRoute': return (context.completedExpeditions ?? []).includes(requirement.id);
  }
}

export function prerequisiteStatus(requirements: Prerequisite[] | undefined, context: ProgressionContext) {
  const checks = (requirements ?? []).map(requirement => ({ requirement, met: prerequisiteMet(requirement, context) }));
  return {
    unlocked: checks.every(check => check.met),
    checks,
    missing: checks.filter(check => !check.met).map(check => check.requirement.kind === 'skill' ? check.requirement.label.replace(/(\d+)$/, value => String(Number(value) * 2)) : check.requirement.label),
  };
}
