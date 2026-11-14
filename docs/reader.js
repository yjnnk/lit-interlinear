import { opening, translations, wordGlosses } from './glosses.js';

const app = document.querySelector('#app');
const labels = ['I', 'II', 'III', 'IV'];
const authors = [{ name: 'Virgílio', works: [{ title: 'Geórgicas', id: 'georgicas' }] }];
const dictionary = 'https://logeion.uchicago.edu/';
let books;

function link(id, book) {
  return '#' + [id, book].join('/');
}

function bookLinks(work, current) {
  return labels.map((label, index) => {
    const book = index + 1;
    return `<a href="${link(work.id, book)}" ${book === current ? 'aria-current="page"' : ''}>Livro ${label}</a>`;
  }).join('');
}

function catalog() {
  return `<h1>Catálogo</h1><div class="catalog">${authors.map(author =>
    `<details open><summary>${author.name}</summary>${author.works.map(work =>
      `<article><h2>${work.title}</h2><nav class="books" aria-label="Livros">${bookLinks(work)}</nav></article>`
    ).join('')}</details>`
  ).join('')}</div>`;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function dictionaryEntry(target, form, gloss, book, verse) {
  target.replaceChildren(element('h3', form, 'entry'), element('p', `Livro ${labels[book - 1]}, verso ${verse}`, 'muted'));
  target.firstChild.lang = 'la';
  if (gloss) target.append(element('p', gloss[1]));
  else {
    const lookup = element('a', 'Consultar no Logeion');
    const key = form.toLowerCase().replace(/[^a-z]/g, '');
    lookup.href = dictionary + encodeURIComponent(key);
    target.append(element('p', 'Verbete em português ainda indisponível.'), lookup);
    if (key.includes('u')) {
      const alternate = element('a', 'Consultar com grafia v');
      alternate.href = dictionary + encodeURIComponent(key.replace(/u(?=[aeiouy])/g, 'v'));
      if (alternate.href !== lookup.href) target.append(element('br',''), alternate);
    }
  }
}

function render() {
  const [id, rawBook] = location.hash.slice(1).split('/');
  const work = authors.flatMap(author => author.works).find(item => item.id === id);
  const book = Number(rawBook);
  if (!work || !Number.isInteger(book) || !books[book - 1]) {
    app.innerHTML = catalog();
    document.title = 'Catálogo · Leitor latino';
    return;
  }
  const lines = books[book - 1];
  document.title = `Geórgicas · Livro ${labels[book - 1]}`;
  app.innerHTML = `
    <a href="#">Catálogo</a>
    <h1>${work.title}</h1>
    <h2>Virgílio · Livro ${labels[book - 1]}</h2>
    <nav class="books" aria-label="Livros">${bookLinks(work, book)}</nav>
    <p class="note muted">Selecione uma palavra para consultar o vocabulário.</p>
    ${translations[book] ? `<p class="note muted">Livro I · glosas palavra por palavra nos versos 1–${(wordGlosses[book]?.length ?? 0) + 6} e tradução alinhada nos versos 7–${translations[book].length + 6}.</p>` : '<p class="note muted">Tradução em português ainda indisponível neste livro.</p>'}
    <div class="layout">
      <section class="verses" aria-label="Texto latino"></section>
      <aside class="sidebar"><section class="panel"><h2>Vocabulário</h2><div id="entry" aria-live="polite">Selecione uma palavra.</div></section></aside>
    </div>
    <dialog aria-labelledby="dialog-title"><form method="dialog"><button class="control">Fechar</button></form><h2 id="dialog-title">Vocabulário</h2><div id="mobile-entry"></div></dialog>`;
  const dialog = app.querySelector('dialog');
  const verses = app.querySelector('.verses');
  const mobile = matchMedia('(max-width: 760px)');
  let selected;
  lines.forEach((line, index) => {
    const verse = index + 1;
    const row = element('div', '', 'verse');
    row.append(element('span', String(verse), 'number'));
    const tokens = element('div', '', 'tokens');
    line.split(/\s+/).forEach((form, position) => {
      const gloss = opening[book]?.[verse - 1]?.[position];
      const word = element('button', '', 'word');
      word.type = 'button';
      word.setAttribute('aria-pressed', 'false');
      const latin = element('span', form);
      latin.lang = 'la';
      word.append(latin);
      const translation = gloss?.[0] ?? wordGlosses[book]?.[verse - 7]?.[position];
      if (translation) word.append(element('small', translation));
      word.addEventListener('click', () => {
        selected?.setAttribute('aria-pressed', 'false');
        word.setAttribute('aria-pressed', 'true');
        selected = word;
        for (const selector of ['#entry', '#mobile-entry']) {
          dictionaryEntry(app.querySelector(selector), form, gloss, book, verse);
        }
        if (mobile.matches) dialog.showModal();
      });
      tokens.append(word);
    });
    const content = element('div', '', 'verse-content');
    content.append(tokens);
    const translation = translations[book]?.[verse - 7];
    if (translation) content.append(element('div', translation, 'translation'));
    row.append(content);
    verses.append(row);
  });
}

try {
  const response = await fetch(new URL('./georgicas.json', import.meta.url));
  if (!response.ok) throw new Error(response.status);
  books = await response.json();
  render();
  addEventListener('hashchange', () => {
    render();
    scrollTo(0, 0);
  });
} catch {
  app.textContent = 'O catálogo não pôde ser carregado. Recarregue a página para tentar novamente.';
}
