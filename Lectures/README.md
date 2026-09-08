# Лекція 1 — Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5

Презентація-застосунок на **Astro + Tailwind CSS v4**. 24 слайди, навігація на чистих
браузерних API (DOM/BOM), деплой на GitHub Pages одним `git push`.

## Швидкий старт

```bash
npm install
npm run dev      # http://localhost:4321/lecture-1-slides/
```

## Команди

| Команда | Дія |
|---------|-----|
| `npm run dev` | сервер розробки |
| `npm run build` | збірка в `./dist` |
| `npm run preview` | перегляд продакшн-збірки |

## Гарячі клавіші

`→` `Space` наступний · `←` попередній · `Home`/`End` край колоди ·
`N` нотатки доповідача · `F` повний екран · `T` світла/темна тема · `Ctrl+P` експорт у PDF

## Документація

Повний покроковий посібник зі збірки та деплою — [docs/presentation-app-guide.md](docs/presentation-app-guide.md).

## Деплой

Перед першим пушем у `astro.config.mjs` замініть `YOUR-USERNAME` на свій GitHub-логін,
а в репозиторії увімкніть **Settings → Pages → Source: GitHub Actions**.
