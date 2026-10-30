import type { Slide } from '../../schema';

export const deckTitle = 'Introduction to Web Accessibility';
export const summary = 'A preview of the Web Accessibility course.';

export const slides: Slide[] = [
  {
    id: 'intro',
    kind: 'title',
    title: deckTitle,
    subtitle: summary,
  },
  {
    id: 'course-preview',
    kind: 'content',
    title: 'Coming soon',
    lead: 'This course is being prepared.',
  },
];
