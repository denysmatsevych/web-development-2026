// Фільми кінотеатру. `colors` — два кольори обкладинки, яку малює
// компонент Poster.
export const movies = [
  {
    id: 'tini-zabutykh-predkiv',
    title: 'Тіні забутих предків',
    year: 1965,
    director: 'Сергій Параджанов',
    description:
      'Історія кохання Івана й Марічки в гуцульському селі за повістю Михайла Коцюбинського.',
    colors: ['#7a2e1f', '#e0a43a'],
  },
  {
    id: 'zemlia',
    title: 'Земля',
    year: 1930,
    director: 'Олександр Довженко',
    description:
      'Німий фільм про українське село в роки колективізації: про працю, смерть і землю.',
    colors: ['#3d4a2a', '#c8b273'],
  },
  {
    id: 'kaminnyi-khrest',
    title: 'Камінний хрест',
    year: 1968,
    director: 'Леонід Осика',
    description:
      'За новелами Василя Стефаника: селянин Іван Дідух прощається з рідним селом перед від’їздом до Канади.',
    colors: ['#3b3f47', '#a7adb8'],
  },
  {
    id: 'bilyi-ptakh-z-chornoiu-oznakoiu',
    title: 'Білий птах з чорною ознакою',
    year: 1971,
    director: 'Юрій Іллєнко',
    description:
      'Буковинська родина Дзвонарів, чиї сини в роки Другої світової війни опиняються по різні боки.',
    colors: ['#1f3550', '#d9dde3'],
  },
  {
    id: 'vavylon-xx',
    title: 'Вавилон ХХ',
    year: 1979,
    director: 'Іван Миколайчук',
    description:
      'Режисерський дебют Івана Миколайчука за романом Василя Земляка «Лебедина зграя».',
    colors: ['#5a3a5e', '#e6b8a2'],
  },
  {
    id: 'propala-hramota',
    title: 'Пропала грамота',
    year: 1972,
    director: 'Борис Івченко',
    description:
      'Козак Василь везе гетьманську грамоту до столиці. За мотивами повісті Миколи Гоголя.',
    colors: ['#8a5a14', '#f1d78a'],
  },
]

export function findMovie(id) {
  return movies.find((movie) => movie.id === id)
}
