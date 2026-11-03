/**
 * Presentation topics, read at build time from the «Теми презентацій» table
 * of the course plan. The plan stays their single source: a topic renamed or
 * added there changes on the slides with the next build.
 *
 * The table has a header row per lecture, `| **Лекція N** | **title** | |`,
 * followed by that lecture's topics, `| ПN.k | topic | what to show |`; the
 * last cell becomes the topic's `detail`. The build fails instead of
 * rendering empty, short or misfiled slides when a row starts like a topic
 * but doesn't have exactly those three cells, when lectures or topics are out
 * of order or outside their lecture's block, or when the table yields no
 * topics.
 */
import plan from '../../../../../docs/react/course-plan.md?raw';
import type { NumberedItem } from '../../schema';

export interface LectureTopics {
  lecture: number;
  /** The lecture's topic, as its header row in the table names it. */
  title: string;
  topics: NumberedItem[];
}

const lectureRow = /^\| \*\*Лекція (\d+)\*\* \| \*\*(.+?)\*\* \|/;
const topicRow = /^\|\s*(П(\d+)\.\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/;
/** Any row that starts like a topic, a Latin `P` included, so a malformed one can't drop out unnoticed. */
const topicLikeRow = /^\|\s*[ПP]\s*\d/;

function parseTopics(markdown: string): LectureTopics[] {
  const lectures: LectureTopics[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    const header = lectureRow.exec(line);
    if (header) {
      const lecture = Number(header[1]);
      if (lecture !== lectures.length + 1) {
        throw new Error(`Course plan: the «Лекція ${lecture}» row comes where «Лекція ${lectures.length + 1}» should.`);
      }
      lectures.push({ lecture, title: header[2], topics: [] });
      continue;
    }

    if (!topicLikeRow.test(line)) continue;
    const topic = topicRow.exec(line);
    if (!topic) {
      throw new Error(`Course plan: can't read the topic row «${line.trim()}»; it needs exactly three cells, | ПN.k | topic | what to show |, with a Cyrillic П and no pipe inside a cell.`);
    }
    const current = lectures.at(-1);
    if (!current || current.lecture !== Number(topic[2])) {
      throw new Error(`Course plan: topic ${topic[1]} is not under the «Лекція ${topic[2]}» row.`);
    }
    const expected = `П${current.lecture}.${current.topics.length + 1}`;
    if (topic[1] !== expected) {
      throw new Error(`Course plan: topic ${topic[1]} comes where ${expected} should.`);
    }
    current.topics.push({ id: topic[1], title: topic[3], detail: topic[4] || undefined });
  }

  if (lectures.length === 0 || lectures.some((lecture) => lecture.topics.length === 0)) {
    throw new Error('Course plan: the «Теми презентацій» table is missing or has a lecture without topics.');
  }
  return lectures;
}

export const presentationTopics = parseTopics(plan);
