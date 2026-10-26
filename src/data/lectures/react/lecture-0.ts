import type { Slide } from '../schema';
import { presentationTopics } from './presentation-topics';

export const deckTitle = 'Знайомство з курсом';

/** Тем на одному слайді: стільки рядків таблиці з поясненнями вміщує екран 1280×720. */
const topicsPerSlide = 8;

export const slides: Slide[] = [
  {
    id: 'intro',
    kind: 'title',
    title: deckTitle,
    subtitle: 'План семестру, оцінювання і теми презентацій',
    note: 'Мета заняття: кожен виходить із розумінням, як влаштований семестр і за що ставляться бали, і вже думає, які теми презентацій узяти. Теми до Лекції 1 захищають на наступній лекції — їх треба розібрати першими.',
  },
  {
    id: 'about',
    kind: 'facts',
    title: 'Про курс',
    subtitle: '3 курс · 1 семестр 2026/2027 · обов’язкова дисципліна ОПП «Комп’ютерні науки»',
    lead: 'Як будувати вебзастосунки на React 19: від першого компонента до застосунку на Next.js, розгорнутого через CI/CD.',
    facts: [
      { label: 'Обсяг', value: '5 ECTS', note: '150 годин, з них 2 — консультації' },
      { label: 'Лекції', value: '8', note: '16 год.; на кожній — захист презентацій' },
      { label: 'Лабораторні', value: '27', note: '54 год.; кожна — 1 бал після захисту' },
      { label: 'Самостійна робота', value: '78 год.', note: 'документація, презентації, проєкт' },
      { label: 'Модульні контролі', value: '2', note: 'ПМК 1 у слоті ЛР 9, ПМК 2 — ЛР 18' },
      { label: 'Підсумковий контроль', value: 'Екзамен', note: 'публічний захист фінального проєкту' },
    ],
    bullets: [
      '**Викладач:** Мацевич Денис Володимирович · [denys.matsevych@oa.edu.ua](mailto:denys.matsevych@oa.edu.ua)',
    ],
  },
  {
    id: 'outcomes',
    kind: 'cards',
    title: 'Що ви вмітимете після курсу',
    subtitle: 'Кожна лекція додає навичку й інструменти до неї',
    cards: [
      {
        label: 'Лекція 1',
        title: 'Будувати доступний інтерфейс із компонентів',
        tags: ['JSX', 'props', 'семантика', 'a11y', 'Vite'],
      },
      {
        label: 'Лекція 2',
        title: 'Керувати станом і формами',
        tags: ['useState', 'useEffect', 'хуки React 19', 'React Hook Form', 'Zod'],
      },
      {
        label: 'Лекція 3',
        title: 'Застосовувати патерни проєктування',
        tags: ['Custom Hooks', 'Render Props', 'HOC', 'Compound Components'],
      },
      {
        label: 'Лекція 4',
        title: 'Будувати архітектуру й глобальний стан',
        tags: ['useReducer', 'Context API', 'Zustand', 'Redux Toolkit', 'FSD'],
      },
      {
        label: 'Лекція 5',
        title: 'Працювати з маршрутами й даними з API',
        tags: ['React Router v7', 'Fetch', 'Axios', 'TanStack Query'],
      },
      {
        label: 'Лекція 6',
        title: 'Оптимізувати й тестувати',
        tags: ['React Compiler', 'memo', 'Suspense', 'Vitest', 'RTL', 'axe'],
      },
      {
        label: 'Лекція 7',
        title: 'Рендерити на сервері',
        tags: ['Next.js', 'Server Components', 'SSR', 'SSG'],
      },
      {
        label: 'Лекція 8',
        title: 'Типізувати й розгортати',
        tags: ['TypeScript', 'CI/CD', 'Vercel'],
      },
    ],
  },

  // ── РОЗДІЛ 1 ────────────────────────────────────────────────
  {
    id: 'section-plan',
    kind: 'section',
    title: 'Розділ 1',
    subtitle: 'План курсу',
  },
  {
    id: 'course-map',
    kind: 'roadmap',
    title: 'Семестр на одній схемі',
    subtitle: 'Кожна частина — дві лекції та лабораторні до них, у порядку проведення',
    roadmap: {
      parts: [
        {
          label: 'Частина 1',
          title: 'Основи React та семантика',
          steps: [
            { kind: 'lecture', label: 'Л1', title: 'React 19, JSX, a11y, Vite' },
            { kind: 'lab', label: 'ЛР 1', title: 'Vite, ESLint, Prettier' },
            { kind: 'lab', label: 'ЛР 2', title: 'Компоненти й props' },
            { kind: 'lab', label: 'ЛР 3', title: 'Thinking in React' },
            { kind: 'lecture', label: 'Л2', title: 'Стан і хуки React 19' },
            { kind: 'lab', label: 'ЛР 4', title: 'useState і useEffect' },
            { kind: 'lab', label: 'ЛР 5', title: 'Контрольовані компоненти' },
            { kind: 'lab', label: 'ЛР 6', title: 'Форми: React Hook Form, Zod' },
          ],
          summary: 'ЛР · 6 б.',
        },
        {
          label: 'Частина 2',
          title: 'Патерни проєктування та управління станом',
          steps: [
            { kind: 'lecture', label: 'Л3', title: 'Патерни проєктування' },
            { kind: 'lab', label: 'ЛР 7', title: 'Custom Hooks, Render Props' },
            { kind: 'lab', label: 'ЛР 8', title: 'Compound Components, HOC' },
            { kind: 'control', label: 'ПМК 1', title: 'ЛР 9: тест і практика' },
            { kind: 'lecture', label: 'Л4', title: 'Глобальний стан, FSD' },
            { kind: 'lab', label: 'ЛР 10', title: 'Структура проєкту за FSD' },
            { kind: 'lab', label: 'ЛР 11', title: 'useReducer: складний стан' },
            { kind: 'lab', label: 'ЛР 12', title: 'Context API, prop drilling' },
          ],
          summary: 'ЛР · 5 б. · ПМК 1 · 10 б.',
        },
        {
          label: 'Частина 3',
          title: 'Маршрутизація, асинхронні дані, оптимізація та тестування',
          steps: [
            { kind: 'lecture', label: 'Л5', title: 'React Router v7, REST API' },
            { kind: 'lab', label: 'ЛР 13', title: 'Захищені й lazy-маршрути' },
            { kind: 'lab', label: 'ЛР 14', title: 'Fetch, Axios і TanStack Query' },
            { kind: 'lecture', label: 'Л6', title: 'Оптимізація й тестування' },
            { kind: 'lab', label: 'ЛР 15', title: 'Мемоізація, React Compiler' },
            { kind: 'lab', label: 'ЛР 16', title: 'Code splitting, Suspense' },
            { kind: 'lab', label: 'ЛР 17', title: 'Тести: Vitest, RTL, axe' },
            { kind: 'control', label: 'ПМК 2', title: 'ЛР 18: тест і завдання' },
          ],
          summary: 'ЛР · 5 б. · ПМК 2 · 10 б.',
        },
        {
          label: 'Частина 4',
          title: 'Екосистема React 19, Next.js та фінальний проєкт',
          steps: [
            { kind: 'lecture', label: 'Л7', title: 'Next.js і Server Components' },
            { kind: 'lecture', label: 'Л8', title: 'TypeScript, CI/CD, Vercel' },
            { kind: 'lab', label: 'ЛР 19', title: 'TypeScript у React' },
            { kind: 'lab', label: 'ЛР 20', title: 'Next.js: SSR і SSG' },
            { kind: 'project', label: 'ЛР 21–22', title: 'Етап 1: архітектура, UI/UX' },
            { kind: 'project', label: 'ЛР 23–24', title: 'Етап 2: компоненти й дані' },
            { kind: 'project', label: 'ЛР 25–26', title: 'Етап 3: оптимізація, тести, a11y' },
            { kind: 'project', label: 'ЛР 27', title: 'Етап 4: деплой, передзахист' },
          ],
          summary: 'ЛР · 9 б.',
        },
      ],
      finale: 'Екзамен: публічний захист фінального проєкту · 35 б.',
    },
    note: 'Ідіть колонками зліва направо. ПМК 1 і ПМК 2 проходять у слотах ЛР 9 і ЛР 18. Майже вся Частина 4 — фінальний проєкт, а його захист і є екзаменом.',
  },
  {
    id: 'semester-rhythm',
    kind: 'cards',
    title: 'Як проходить семестр',
    subtitle: 'Чотири види роботи; кольори — як на схемі семестру',
    cards: [
      {
        kind: 'lecture',
        label: 'Лекція',
        title: 'Нова тема й презентації',
        text: 'Відкриває тему частини. На ній же захищають презентації, що продовжують цю тему.',
        tags: ['8 лекцій', '2 год.', 'презентація — до 5 б.'],
      },
      {
        kind: 'lab',
        label: 'Лабораторна',
        title: 'Практика й захист',
        text: 'Практична робота на занятті. Зараховується після захисту.',
        tags: ['27 робіт', '2 год.', '1 бал'],
      },
      {
        kind: 'control',
        label: 'Модульний контроль',
        title: 'Перевірка частини курсу',
        text: 'Тест і практичні завдання в слоті звичайної лабораторної.',
        tags: ['ПМК 1 — ЛР 9', 'ПМК 2 — ЛР 18', 'по 10 б.'],
      },
      {
        label: 'Самостійна робота',
        title: 'Між заняттями',
        text: 'Документація, підготовка до лабораторних, презентації, фінальний проєкт.',
        tags: ['78 год.'],
      },
    ],
  },
  {
    id: 'final-project',
    kind: 'timeline',
    title: 'Фінальний проєкт',
    subtitle: 'ЛР 21–26 — подвійні заняття по 4 год., тож 27 лабораторних — це 24 зустрічі',
    lead: 'Ваш власний React-застосунок від ідеї до деплою. Його публічний захист і є екзаменом.',
    timeline: {
      steps: [
        {
          label: 'ЛР 21–22 · 4 год.',
          title: 'Планування',
          items: ['архітектура', 'вибір стеку', 'проєктування UI/UX'],
        },
        {
          label: 'ЛР 23–24 · 4 год.',
          title: 'Реалізація',
          items: ['компоненти', 'стан', 'асинхронні запити'],
        },
        {
          label: 'ЛР 25–26 · 4 год.',
          title: 'Якість',
          items: ['оптимізація', 'тестування', 'доступність (a11y)'],
        },
        {
          label: 'ЛР 27 · 2 год.',
          title: 'Запуск',
          items: ['деплой', 'попередній захист'],
        },
      ],
      finale: {
        label: 'Екзамен · 35 б.',
        title: 'Публічний захист',
        items: ['код і архітектура', 'стандарти доступності', 'теоретичні питання'],
      },
    },
  },

  // ── РОЗДІЛ 2 ────────────────────────────────────────────────
  {
    id: 'section-grading',
    kind: 'section',
    title: 'Розділ 2',
    subtitle: 'Оцінювання',
  },
  {
    id: 'points',
    kind: 'diagram',
    title: 'Як складаються 100 балів',
    subtitle: 'Довжина смуги — кількість балів',
    diagram: [
      `Лабораторні роботи   25 б.  ${'█'.repeat(25)}`,
      `Модульні контролі    20 б.  ${'█'.repeat(20)}`,
      `Презентації          20 б.  ${'█'.repeat(20)}`,
      `Екзамен              35 б.  ${'█'.repeat(35)}`,
      `                            ${'─'.repeat(35)}`,
      '                            поточна робота 65 б. + екзамен 35 б.',
      '',
      'Лабораторна: 1 б. після захисту     ПМК 1, ПМК 2: по 10 б.',
      'Презентація: до 5 б., у суму йдуть до чотирьох',
    ].join('\n'),
  },
  {
    id: 'scale',
    kind: 'diagram',
    title: 'Шкала оцінювання',
    subtitle: 'Сума балів за семестр → оцінка ECTS і національна оцінка',
    diagram: [
      'Бали     ECTS   Оцінка',
      '──────   ────   ─────────────────────────────────────────────────────────',
      '91–100   A      відмінно',
      '83–90    B      добре',
      '76–82    C      добре',
      '68–75    D      задовільно',
      '61–67    E      задовільно',
      '20–60    FX     незадовільно з можливістю повторного складання',
      '0–19     F      незадовільно з обов’язковим повторним вивченням дисципліни',
    ].join('\n'),
  },

  // ── РОЗДІЛ 3 ────────────────────────────────────────────────
  {
    id: 'section-presentations',
    kind: 'section',
    title: 'Розділ 3',
    subtitle: 'Презентації',
  },
  ...presentationTopics.flatMap((lecture) =>
    Array.from(
      { length: Math.ceil(lecture.topics.length / topicsPerSlide) },
      (_, page): Slide => {
        const topics = lecture.topics.slice(page * topicsPerSlide, (page + 1) * topicsPerSlide);
        return {
          id: `topics-${lecture.lecture}-${page + 1}`,
          kind: 'topics',
          title: `Теми до Лекції ${lecture.lecture}`,
          subtitle: `${lecture.title} · ${topics[0].id}–${topics[topics.length - 1].id}`,
          topics,
          topicHeaders: { title: 'Тема', detail: 'Що дослідити й показати в коді' },
        };
      },
    ),
  ),

  // ── РОЗДІЛ 4 ────────────────────────────────────────────────
  {
    id: 'section-rules',
    kind: 'section',
    title: 'Розділ 4',
    subtitle: 'Правила курсу та література',
  },
  {
    id: 'policies',
    kind: 'content',
    title: 'Правила курсу',
    bullets: [
      '**Відвідування** обов’язкове; пропущене відпрацьовують у строки, які встановлює деканат.',
      '**Онлайн** — Google Meet (кодове слово «denysmatsevych»), акаунт oa.edu.ua, фото й повне ім’я. На тестах — камера і демонстрація екрана.',
      '**Доброчесність** — за Законом «Про академічну доброчесність» і Кодексом НаУОА.',
      '**ШІ** можна використовувати, якщо зазначити інструмент і як саме. Його відповідь — неперевірений матеріал.',
      '**Неформальну освіту** зараховує викладач, індивідуально.',
    ],
  },
  {
    id: 'reading',
    kind: 'content',
    title: 'Література',
    subtitle: 'Основна',
    bullets: [
      'Документація [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router v7](https://reactrouter.com/)',
      'R. Wieruch — [The Road to React](https://www.roadtoreact.com/) · N. Makarevich — [Advanced React](https://www.advanced-react.com/) · K. C. Dodds — [Epic React](https://epicreact.dev/)',
      'С. Стефанов — «React: швидкий старт». К.: Фабула, 2023',
      '**Допоміжна:** [TanStack Query](https://tanstack.com/query/latest), [Zustand](https://zustand.docs.pmnd.rs/), [Redux Toolkit](https://redux-toolkit.js.org/), [Next.js](https://nextjs.org/docs), [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Feature-Sliced Design](https://feature-sliced.design/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)',
    ],
  },
  {
    id: 'next-steps',
    kind: 'checklist',
    title: 'До наступного заняття',
    bullets: [
      'Перегляньте теми до Лекції 1 і Лекції 2: їх захищають першими.',
      'Узгодьте з викладачем щонайменше дві теми презентацій.',
      'Ознайомтеся з документацією [React](https://react.dev/learn) і [Vite](https://vite.dev/guide/) — самостійна робота до Лекції 1.',
      'Встановіть Node.js LTS, Git і VS Code: на ЛР 1 налаштовуємо середовище розробки.',
    ],
  },
];
