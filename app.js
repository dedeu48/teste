const STORAGE_KEY = 'hebraicoBiblicoDoneLessons';

const listEl = document.getElementById('lesson-list');
const contentEl = document.getElementById('lesson-content');
const searchEl = document.getElementById('search');
const progressEl = document.getElementById('progress');
const progressTextEl = document.getElementById('progress-text');
const shuffleBtn = document.getElementById('shuffle');
const cardEl = document.getElementById('card');
const moduleTagEl = document.getElementById('module-tag');
const prevBtn = document.getElementById('prev-lesson');
const nextBtn = document.getElementById('next-lesson');
const clearProgressBtn = document.getElementById('clear-progress');

const fallbackVocabulary = [
  ['אָב', 'av', 'pai'], ['אֵם', 'em', 'mãe'], ['בֵּן', 'ben', 'filho'], ['בַּת', 'bat', 'filha'],
  ['אֶרֶץ', 'erets', 'terra'], ['שָׁמַיִם', 'shamayim', 'céus'], ['יָם', 'yam', 'mar'], ['אוֹר', 'or', 'luz'],
  ['חֹשֶׁךְ', 'ḥoshekh', 'trevas'], ['יוֹם', 'yom', 'dia'], ['לַיְלָה', 'laylah', 'noite'], ['בַּיִת', 'bayit', 'casa'],
  ['סֵפֶר', 'sefer', 'livro'], ['אָמַר', 'amar', 'dizer'], ['הָלַךְ', 'halakh', 'andar/ir'], ['שָׁלוֹם', 'shalom', 'paz'],
  ['קֹדֶשׁ', 'qodesh', 'santidade'], ['מֶלֶךְ', 'melekh', 'rei'], ['תּוֹרָה', 'torah', 'instrução/lei'], ['רוּחַ', 'ruaḥ', 'espírito/vento']
];

let lessons = [];
let vocabulary = [...fallbackVocabulary];
let done = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
let currentId = null;

function showLoadError(message) {
  moduleTagEl.textContent = 'Erro de carregamento';
  contentEl.innerHTML = `
    <h2>Não foi possível carregar o curso</h2>
    <p>${message}</p>
    <p class="muted">Verifique se o servidor está apontando para a pasta correta do projeto e abra a URL da própria aplicação (ex.: <code>/index.html</code>).</p>
  `;
}

function parseLessons(markdown) {
  const lines = markdown.split('\n');
  let module = null;
  let inCurriculum = false;

  return lines
    .map((line) => line.trim())
    .filter((line) => line)
    .flatMap((line) => {
      if (/^##\s+Módulo\s+\d+/i.test(line)) {
        module = line.replace(/^##\s+/, '').trim();
        inCurriculum = true;
        return [];
      }

      if (/^##\s+/.test(line)) {
        inCurriculum = false;
        return [];
      }

      if (!inCurriculum || !/^\d+\.\s+\*\*/.test(line)) {
        return [];
      }

      const idMatch = line.match(/^(\d+)\./);
      const titleMatch = line.match(/^\d+\.\s+\*\*(.*?)\*\*\s*—\s*(.*)$/);
      const id = Number(idMatch?.[1]);
      const title = titleMatch?.[1] || `Lição ${id}`;
      const description = titleMatch?.[2] || line.replace(/^\d+\.\s+\*\*(.*?)\*\*/, '').trim();

      return [{ id, title, description, module, raw: line }];
    });
}

function parseVocabulary(markdown) {
  const lines = markdown.split('\n');
  const entries = [];

  lines.forEach((line) => {
    const termMatches = [...line.matchAll(/([\u0590-\u05FF][\u0590-\u05FF\u05B0-\u05FF\u05BE'״׳]*)\s+([a-zA-Z\-\u02BB\u1E25\u1E63\u1E6D\u1E0D]+),\s*“([^”]+)”/g)];
    termMatches.forEach((match) => entries.push([match[1], match[2], match[3]]));
  });

  return entries.length ? entries : fallbackVocabulary;
}

function saveDone() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
}

function updateProgress() {
  const validDone = [...done].filter((id) => lessons.some((lesson) => lesson.id === id));
  if (validDone.length !== done.size) {
    done = new Set(validDone);
    saveDone();
  }
  progressEl.value = done.size;
  progressTextEl.textContent = `${done.size}/${lessons.length} concluídas`;
}

function renderLessonList(filter = '') {
  const q = filter.toLowerCase();
  listEl.innerHTML = '';

  lessons
    .filter((lesson) => (
      lesson.title.toLowerCase().includes(q)
      || lesson.description.toLowerCase().includes(q)
      || lesson.module.toLowerCase().includes(q)
      || String(lesson.id).includes(q)
    ))
    .forEach((lesson) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `lesson-btn ${done.has(lesson.id) ? 'done' : ''} ${currentId === lesson.id ? 'active' : ''}`;
      btn.textContent = `${lesson.id}. ${lesson.title}`;
      btn.title = lesson.module;
      btn.addEventListener('click', () => showLesson(lesson.id));
      li.appendChild(btn);
      listEl.appendChild(li);
    });
}

function updateNavButtons(id) {
  const currentIndex = lessons.findIndex((item) => item.id === id);
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex < 0 || currentIndex >= lessons.length - 1;
}

function getLessonByOffset(id, offset) {
  const currentIndex = lessons.findIndex((item) => item.id === id);
  const target = lessons[currentIndex + offset];
  return target?.id ?? null;
}

function showLesson(id) {
  const lesson = lessons.find((item) => item.id === id);
  if (!lesson) return;
  currentId = id;
  renderLessonList(searchEl.value);
  updateNavButtons(id);
  moduleTagEl.textContent = lesson.module;

  contentEl.innerHTML = `
    <h2>${lesson.id}. ${lesson.title}</h2>
    <p>${lesson.description}</p>
    <p class="muted"><strong>Módulo:</strong> ${lesson.module}</p>
    <label class="done-toggle">
      <input id="mark-done" type="checkbox" ${done.has(id) ? 'checked' : ''} />
      Marcar lição como concluída
    </label>
  `;

  document.getElementById('mark-done').addEventListener('change', (e) => {
    if (e.target.checked) done.add(id);
    else done.delete(id);
    saveDone();
    updateProgress();
    renderLessonList(searchEl.value);
  });
}

function showRandomWord() {
  const [he, tr, pt] = vocabulary[Math.floor(Math.random() * vocabulary.length)];
  cardEl.innerHTML = `
    <h3>${he}</h3>
    <p><strong>Transliteração:</strong> ${tr}</p>
    <p><strong>Português:</strong> ${pt}</p>
    <p class="muted">Vocabulário total detectado: ${vocabulary.length} termos.</p>
  `;
}

function clearProgress() {
  done.clear();
  saveDone();
  updateProgress();
  renderLessonList(searchEl.value);
  if (currentId) showLesson(currentId);
}

async function init() {
  try {
    const response = await fetch('curso-hebraico-biblico.md', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Arquivo do curso não encontrado (HTTP ${response.status}).`);
    }

    const markdown = await response.text();
    lessons = parseLessons(markdown);

    if (!lessons.length) {
      throw new Error('Conteúdo carregado, mas nenhuma lição foi detectada no Markdown.');
    }

    vocabulary = parseVocabulary(markdown);
  } catch (error) {
    lessons = [{
      id: 1,
      title: 'Modo de recuperação',
      description: 'A aplicação iniciou em modo de recuperação porque o arquivo principal não foi carregado.',
      module: 'Sistema',
      raw: '1. **Modo de recuperação** — Falha no carregamento do curso.'
    }];
    vocabulary = [...fallbackVocabulary];
    showLoadError(error.message);
  }

  progressEl.max = lessons.length;
  updateProgress();
  renderLessonList();
  if (lessons[0]) showLesson(lessons[0].id);

  searchEl.addEventListener('input', () => renderLessonList(searchEl.value));
  shuffleBtn.addEventListener('click', showRandomWord);
  prevBtn.addEventListener('click', () => {
    const targetId = getLessonByOffset(currentId, -1);
    if (targetId) showLesson(targetId);
  });
  nextBtn.addEventListener('click', () => {
    const targetId = getLessonByOffset(currentId, 1);
    if (targetId) showLesson(targetId);
  });
  clearProgressBtn.addEventListener('click', clearProgress);
}

init();
