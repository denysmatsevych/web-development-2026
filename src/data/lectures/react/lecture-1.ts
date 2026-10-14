import type { Slide } from '../schema';

export const deckTitle = 'Introduction to React';

export const slides: Slide[] = [
  {
    id: 'intro',
    kind: 'title',
    title: deckTitle,
    subtitle: 'A preview of the React course',
  },
  {
    id: 'course-preview',
    kind: 'content',
    title: 'Coming soon',
    lead: 'This course is being prepared.',
  },
];
