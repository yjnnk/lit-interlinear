import { opening } from './glosses.js';

const app = document.querySelector('#app');
const labels = ['I', 'II', 'III', 'IV'];
const authors = [{ name: 'Virgílio', works: [{ title: 'Geórgicas', id: 'georgicas' }] }];
const dictionary = 'https://logeion.uchicago.edu/';
const pageSize = 30;
let books;

function link(id, book, page = 1) {
  return '#' + [id, book, page].join('/');
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
  const [id, rawBook, rawPage] = location.hash.slice(1).split('/');
  const work = authors.flatMap(author => author.works).find(item => item.id === id);
  const book = Number(rawBook);
  if (!work || !Number.isInteger(book) || !books[book - 1]) {
    app.innerHTML = catalog();
    document.title = 'Catálogo · Leitor latino';
    return;
  }
  const lines = books[book - 1];
  const pages = Math.ceil(lines.length / pageSize);
  const page = Math.max(1, Math.min(pages, Math.trunc(Number(rawPage)) || 1));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, lines.length);
  document.title = `Geórgicas · Livro ${labels[book - 1]}`;
  app.innerHTML = `
    <a href="#">Catálogo</a>
    <h1>${work.title}</h1>
    <h2>Virgílio · Livro ${labels[book - 1]}</h2>
    <nav class="books" aria-label="Livros">${bookLinks(work, book)}</nav>
    <p class="note muted">Glosas em português disponíveis no Livro I, versos 1–6. Selecione uma palavra para consultar o vocabulário.</p>
    <label class="controls">Versos <select id="range">${Array.from({length: pages}, (_, i) =>
      `<option value="${i + 1}" ${i + 1 === page ? 'selected' : ''}>${i * pageSize + 1}–${Math.min((i + 1) * pageSize, lines.length)}</option>`).join('')}</select></label>
    <div class="layout">
      <section class="verses" aria-label="Texto latino"></section>
      <aside class="sidebar"><section class="panel"><h2>Vocabulário</h2><div id="entry" aria-live="polite">Selecione uma palavra.</div></section></aside>
    </div>
    <nav class="range-nav" aria-label="Faixas de versos">
      ${page > 1 ? `<a class="control" href="${link(id, book, page - 1)}">Versos anteriores</a>` : '<span></span>'}
      ${page < pages ? `<a class="control" href="${link(id, book, page + 1)}">Próximos versos</a>` : ''}
    </nav>
    <dialog aria-labelledby="dialog-title"><form method="dialog"><button class="control">Fechar</button></form><h2 id="dialog-title">Vocabulário</h2><div id="mobile-entry"></div></dialog>`;
  const dialog = app.querySelector('dialog');
  const verses = app.querySelector('.verses');
  const mobile = matchMedia('(max-width: 760px)');
  app.querySelector('#range').addEventListener('change', event => {
    location.hash = link(id, book, event.target.value);
  });
  let selected;
  lines.slice(start, end).forEach((line, index) => {
    const verse = start + index + 1;
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
      if (gloss) word.append(element('small', gloss[0]));
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
    row.append(tokens);
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
