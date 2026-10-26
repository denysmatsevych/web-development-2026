/**
 * ПК-2 · генератор форм Google Forms з банку завдань (файл Bank.gs у цьому ж проєкті).
 *
 * Кожен запуск createForm() створює НОВУ форму з випадковим набором завдань:
 *   розділ 1 — 16 питань по 0,5 бала, розділ 2 — 4 завдання з кодом по 1 балу.
 * Питання, використані в попередніх формах, беруться лише тоді, коли нових у темі вже немає.
 *
 * Запускайте з академічного акаунта (@oa.edu.ua): тоді форма приймає відповіді лише з нього.
 * Bank.gs містить відповіді, тому в публічному репозиторії його немає: його збирає build.mjs.
 */

const CONFIG = {
  // Для назви файлу й аркуша в таблиці результатів. Студенти її не бачать.
  label: 'КН-313',
  // Порожньо — випадковий вибір. Щоб відтворити набір із попередньої форми, перелічіть
  // номери з її журналу виконання (16 з розділу 1 і 4 з розділу 2), наприклад: ['J05', 'D03', …].
  ids: [],
  title: 'Проміжний контроль №2: JS, DOM, REST API, TypeScript',
  // Тексти називають бали так, як їх показує Forms (1 і 2), і пояснюють перерахунок в оцінку.
  description: [
    'Проміжний контроль №2: JavaScript, DOM, REST API, TypeScript. 30 хвилин.',
    'Розділ 1 — 16 питань по 1 балу. Розділ 2 — 4 завдання з кодом по 2 бали. Разом 24 бали; оцінка за ПК-2 = бали ÷ 2 (максимум 12).',
    'У кожному питанні одна правильна відповідь.',
  ].join('\n'),
  confirmation: 'Відповіді надіслано. Оцінка за ПК-2 = бали ÷ 2.',
  domain: 'oa.edu.ua',
  folderName: 'ПК-2',
  resultsName: 'ПК-2 · результати',
  // Google Forms приймає лише цілі бали, тому всі бали ПК-2 подвоєно: 0,5 → 1, 1 → 2 (разом 24).
  // Не ставте розділу 2 один бал: тоді максимум буде 20, і оцінка ÷ 2 не перевищить 10.
  points: { 1: 1, 2: 2 },
  sections: {
    1: { title: 'Розділ 1 · по 1 балу', help: '16 питань.' },
    2: { title: 'Розділ 2 · по 2 бали', help: '4 завдання з кодом.' },
  },
};

/** Створює нову форму. Перед запуском змініть CONFIG.label на групу. */
function createForm() {
  const props = PropertiesService.getScriptProperties();
  const used = JSON.parse(props.getProperty('usedIds') || '[]');
  const picks = CONFIG.ids.length ? fromIds_(CONFIG.ids) : draw_(used);

  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  const name = 'ПК-2 · ' + CONFIG.label + ' · ' + stamp;
  const folder = folder_(props);

  const form = FormApp.create(name);
  form.setTitle(CONFIG.title)
    .setDescription(CONFIG.description)
    .setIsQuiz(true)
    .setShuffleQuestions(true)
    .setCollectEmail(true)
    .setLimitOneResponsePerUser(true)
    .setAllowResponseEdits(false)
    .setProgressBar(true)
    .setPublishingSummary(false)
    .setShowLinkToRespondAgain(false)
    .setConfirmationMessage(CONFIG.confirmation);
  const locked = lockToDomain_(form);
  DriveApp.getFileById(form.getId()).moveTo(folder);

  // Перша сторінка — лише академічна пошта: студент входить у Google, і Forms записує адресу сам.
  [1, 2].forEach(function (section) {
    form.addPageBreakItem().setTitle(CONFIG.sections[section].title).setHelpText(CONFIG.sections[section].help);
    picks[section].forEach(function (q) { addQuestion_(form, q, CONFIG.points[section]); });
  });

  const resultsUrl = linkResults_(form, props, folder, CONFIG.label + ' · ' + stamp);
  const ids = picks[1].concat(picks[2]).map(function (q) { return q.id; });
  props.setProperty('usedIds', JSON.stringify(used.concat(ids)));

  Logger.log([
    CONFIG.label + ': форму створено.',
    'Для студентів: ' + form.shortenFormUrl(form.getPublishedUrl()),
    'Редагувати: ' + form.getEditUrl(),
    'Результати: ' + resultsUrl,
    'Розділ 1: ' + picks[1].map(function (q) { return q.id; }).join(', '),
    'Розділ 2: ' + picks[2].map(function (q) { return q.id; }).join(', '),
    locked
      ? 'Доступ: лише акаунти @' + CONFIG.domain + ', одна відповідь на акаунт.'
      : 'УВАГА: скрипт запущено не з акаунта @' + CONFIG.domain + ', тому обмежити форму доменом неможливо. ' +
        'Одна відповідь на акаунт працює, а колонка «Пошта» в таблиці позначить чужі адреси.',
    'Вручну: ⚙ Налаштування → «Тести» → «Респонденти бачать»: вимкнути «Пропущені питання» і «Правильні відповіді».',
  ].join('\n'));
}

/** Забуває, які питання вже використано: наступні форми знову братимуть з усього банку. */
function resetUsed() {
  PropertiesService.getScriptProperties().deleteProperty('usedIds');
  Logger.log('Список використаних питань очищено.');
}

// ── Draw: per-topic counts from TOPICS, at most one question per family ───

function draw_(used) {
  const picks = { 1: [], 2: [] };
  const families = {};
  [1, 2].forEach(function (section) {
    Object.keys(TOPICS).forEach(function (topic) {
      const need = TOPICS[topic].take[section - 1];
      if (!need) return;
      const pool = BANK.filter(function (q) { return q.section === section && q.topic === topic; });
      const fresh = shuffle_(pool.filter(function (q) { return used.indexOf(q.id) === -1; }));
      const old = shuffle_(pool.filter(function (q) { return used.indexOf(q.id) !== -1; }));
      const chosen = [];
      fresh.concat(old).forEach(function (q) {
        if (chosen.length === need || (q.family && families[q.family])) return;
        chosen.push(q);
        if (q.family) families[q.family] = true;
      });
      if (chosen.length < need) throw new Error('Замало питань у банку: розділ ' + section + ', тема ' + topic);
      picks[section] = picks[section].concat(chosen);
    });
  });
  return picks;
}

function fromIds_(ids) {
  const picks = { 1: [], 2: [] };
  ids.forEach(function (id) {
    const q = BANK.filter(function (b) { return b.id === id; })[0];
    if (!q) throw new Error('У банку немає питання ' + id);
    picks[q.section].push(q);
  });
  if (picks[1].length !== 16 || picks[2].length !== 4) {
    throw new Error('CONFIG.ids: потрібно 16 питань розділу 1 і 4 розділу 2, а є ' + picks[1].length + ' і ' + picks[2].length);
  }
  return picks;
}

function shuffle_(items) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ── Form items ────────────────────────────────────────────────────────────

function addQuestion_(form, q, points) {
  const item = form.addMultipleChoiceItem().setTitle(q.question).setPoints(points).setRequired(false);
  if (q.code) item.setHelpText(keepSpaces_(q.code));
  // options[0] у банку — правильна відповідь; тут варіанти перемішуються.
  const choices = shuffle_(q.options.map(function (text, i) { return { text: text, correct: i === 0 }; }));
  item.setChoices(choices.map(function (c) { return item.createChoice(c.text, c.correct); }));
}

// Forms стискає звичайні пробіли, тому відступи в коді — нерозривні пробіли.
function keepSpaces_(text) {
  return text.split('\n').map(function (line) {
    return line.replace(/^ +| {2,}/g, function (m) { return ' '.repeat(m.length); });
  }).join('\n');
}

function lockToDomain_(form) {
  const owner = Session.getEffectiveUser().getEmail().toLowerCase();
  if (!owner.endsWith('@' + CONFIG.domain)) return false;
  try {
    form.setRequireLogin(true);
    return true;
  } catch (e) {
    Logger.log('Не вдалося обмежити доменом: ' + e);
    return false;
  }
}

// ── Drive folder and the results spreadsheet ──────────────────────────────

function folder_(props) {
  const id = props.getProperty('folderId');
  if (id) {
    try {
      const existing = DriveApp.getFolderById(id);
      if (!existing.isTrashed()) return existing;
    } catch (e) { /* the folder was deleted: make a new one */ }
  }
  const created = DriveApp.createFolder(CONFIG.folderName);
  props.setProperty('folderId', created.getId());
  return created;
}

function linkResults_(form, props, folder, tabName) {
  let ss = null;
  const id = props.getProperty('resultsId');
  if (id) {
    try {
      if (!DriveApp.getFileById(id).isTrashed()) ss = SpreadsheetApp.openById(id);
    } catch (e) { /* the spreadsheet was deleted: make a new one */ }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.resultsName);
    DriveApp.getFileById(ss.getId()).moveTo(folder);
    props.setProperty('resultsId', ss.getId());
  }

  const before = ss.getSheets().map(function (s) { return s.getSheetId(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  ss = SpreadsheetApp.openById(ss.getId());

  const sheet = ss.getSheets().filter(function (s) { return before.indexOf(s.getSheetId()) === -1; })[0];
  const blank = ss.getSheets().filter(function (s) { return !s.getFormUrl() && s.getLastRow() === 0; });
  blank.forEach(function (s) { if (ss.getSheets().length > 1) ss.deleteSheet(s); });

  if (!sheet) {
    Logger.log('Не знайшов аркуш відповідей: колонку «Оцінка» додайте вручну.');
    return ss.getUrl();
  }
  try {
    sheet.setName(tabName);
    addFormulas_(sheet);
  } catch (e) {
    Logger.log('Колонку «Оцінка» додайте вручну на аркуші «' + sheet.getName() + '»: ' + e);
  }
  return ss.getUrl() + '#gid=' + sheet.getSheetId();
}

function addFormulas_(sheet) {
  const width = sheet.getLastColumn();
  if (!width) throw new Error('на аркуші ще немає заголовків');
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  const letter = function (i) { return sheet.getRange(1, i).getA1Notation().replace(/\d+/g, ''); };
  const find = function (re) {
    for (let i = 0; i < headers.length; i++) if (re.test(headers[i])) return i + 1;
    return 0;
  };

  const scoreCol = find(/^(score|бал|кількість балів|оцінка)/i) || 2;
  const s = letter(scoreCol) + '2:' + letter(scoreCol);
  sheet.getRange(1, width + 1).setFormula(
    '={"Оцінка"; ARRAYFORMULA(IF(' + s + '="", "", ROUND(VALUE(REGEXEXTRACT(TO_TEXT(' + s + '), "\\d+")) / 2)))}');

  const emailCol = find(/(email|e-mail|електронн|пошт)/i);
  if (emailCol) {
    const e = letter(emailCol) + '2:' + letter(emailCol);
    const suffix = '@' + CONFIG.domain;
    sheet.getRange(1, width + 2).setFormula(
      '={"Пошта"; ARRAYFORMULA(IF(' + e + '="", "", IF(RIGHT(LOWER(' + e + '), ' + suffix.length + ') = "' + suffix + '", "ok", "НЕ академічна")))}');
  }
}
