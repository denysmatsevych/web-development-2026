/**
 * Presentation topics, read at build time from the «Теми презентацій» table
 * of the course plan. The plan stays their single source: a topic renamed or
 * added there changes on the slides with the next build.
 *
 * The table has a header row per lecture, `| **Лекція N** | **title** | |`,
 * followed by that lecture's topics, `| ПN.k | topic | what to show |`; the
 * last cell becomes the topic's `detail`. A topic outside its lecture's
 * block, or a table that yields no topics, fails the build instead of
 * rendering empty or misfiled slides.
 */
import plan from '../../../../docs/react/course-plan.md?raw';
import type { NumberedItem } from '../schema';

export interface LectureTopics {
  lecture: number;
  /** The lecture's topic, as its header row in the table names it. */
  title: string;
  topics: NumberedItem[];
}

const lectureRow = /^\| \*\*Лекція (\d+)\*\* \| \*\*(.+?)\*\* \|/;
const topicRow = /^\|\s*(П(\d+)\.\d+)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*$/;

function parseTopics(markdown: string): LectureTopics[] {
  const lectures: LectureTopics[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    const header = lectureRow.exec(line);
    if (header) {
      lectures.push({ lecture: Number(header[1]), title: header[2], topics: [] });
      continue;
    }

    const topic = topicRow.exec(line);
    if (!topic) continue;
    const current = lectures.at(-1);
    if (!current || current.lecture !== Number(topic[2])) {
      throw new Error(`Course plan: topic ${topic[1]} is not under the «Лекція ${topic[2]}» row.`);
    }
    current.topics.push({ id: topic[1], title: topic[3], detail: topic[4] || undefined });
  }

  if (lectures.length === 0 || lectures.some((lecture) => lecture.topics.length === 0)) {
    throw new Error('Course plan: the «Теми презентацій» table is missing or has a lecture without topics.');
  }
  return lectures;
}

export const presentationTopics = parseTopics(plan);
