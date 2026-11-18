import { bookFourEntries, bookThreeEntries, bookTwoEntries, opening, openingEntries, readingDictionaryForms, readingPassages, translations, wordGlosses } from './glosses.js';

const app = document.querySelector('#app');
const labels = ['I', 'II', 'III', 'IV'];
const authors = [{ name: 'Virgílio', works: [{ title: 'Geórgicas', id: 'georgicas' }] }];
const dictionary = 'https://logeion.uchicago.edu/';
let books;
let dictionaryForms = {};

function dictionaryKey(lemma) {
  return lemma.toLowerCase().normalize('NFD')
    .replace(/[^a-z]/g, '').replaceAll('v', 'u').replaceAll('j', 'i');
}
const lexicalBooks = new Map();
let renderId = 0;

async function loadLexicon(book) {
  if (!lexicalBooks.has(book)) {
    const response = await fetch(new URL(`./lexico-${book}.json`, import.meta.url));
    if (!response.ok) throw new Error(response.status);
    lexicalBooks.set(book, await response.json());
  }
  return lexicalBooks.get(book);
}

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

const wordClasses = {
  ADJ: 'adjetivo', ADP: 'preposição', ADV: 'advérbio', AUX: 'verbo auxiliar',
  CCONJ: 'conjunção coordenativa', DET: 'determinante', INTJ: 'interjeição',
  NOUN: 'substantivo', NUM: 'numeral', PART: 'partícula', PRON: 'pronome',
  PROPN: 'nome próprio', SCONJ: 'conjunção subordinativa', VERB: 'verbo',
};

function dictionaryEntry(target, form, gloss, book, verse, parts, entries, contextual) {
  target.replaceChildren(element('h3', form, 'entry'), element('p', `Livro ${labels[book - 1]}, verso ${verse}`, 'muted'));
  target.firstChild.lang = 'la';
  if (contextual) target.append(element('p', `No verso: ${contextual}`));
  const editorialEntries = [openingEntries, bookTwoEntries, bookThreeEntries, bookFourEntries][book - 1];
  const editorialEntry = editorialEntries?.[verse]?.[form.toLowerCase().replace(/[^a-z]/g, '')];
  const edited = editorialEntry ?? gloss?.[1];
  if (edited) {
    const [heading, ...details] = edited.split(' · ');
    const title = element('h4', heading, 'headword');
    title.lang = 'la';
    target.append(title, element('p', details.join(' · ')));
  }
  for (const [lemma, pos, , key] of edited ? [] : parts ?? []) {
    const entry = entries[key];
    const keyForForms = dictionaryKey(lemma);
    const expanded = ((book === 1 && verse >= 183 && verse <= 232) || book === 3 || book === 4)
      ? readingDictionaryForms[keyForForms]
      : undefined;
    const title = element('h4', expanded ?? dictionaryForms[keyForForms] ?? entry?.[0] ?? lemma, 'headword');
    title.lang = 'la';
    target.append(title, element('p', [wordClasses[pos] ?? pos, entry?.[1]].filter(Boolean).join(' · '), 'muted'));
    if (entry) {
      const definitions = element('ul', '');
      for (const definition of entry[2]) definitions.append(element('li', definition));
      target.append(definitions, element('p', entry[3], 'muted'));
    }
  }
  if (!edited && (!parts?.length || parts.some(part => !entries[part[3]]))) {
    const lookup = element('a', 'Consultar no Logeion');
    const key = form.toLowerCase().replace(/[^a-z]/g, '');
    lookup.href = dictionary + encodeURIComponent(key);
    target.append(element('p', 'Uma ou mais acepções em português ainda estão indisponíveis.'), lookup);
    if (key.includes('u')) {
      const alternate = element('a', 'Consultar com grafia v');
      alternate.href = dictionary + encodeURIComponent(key.replace(/u(?=[aeiouy])/g, 'v'));
      if (alternate.href !== lookup.href) target.append(element('br',''), alternate);
    }
  }
}

async function render() {
  const revision = ++renderId;
  const [id, rawBook] = location.hash.slice(1).split('/');
  const work = authors.flatMap(author => author.works).find(item => item.id === id);
  const book = Number(rawBook);
  if (!work || !Number.isInteger(book) || !books[book - 1]) {
    app.innerHTML = catalog();
    document.title = 'Catálogo · Leitor latino';
    return;
  }
  const lines = books[book - 1];
  const [annotations, entries] = await loadLexicon(book).catch(() => [[], {}]);
  if (revision !== renderId) return;
  document.title = `Geórgicas · Livro ${labels[book - 1]}`;
  app.innerHTML = `
    <a href="#">Catálogo</a>
    <h1>${work.title}</h1>
    <h2>Virgílio · Livro ${labels[book - 1]}</h2>
    <nav class="books" aria-label="Livros">${bookLinks(work, book)}</nav>
    <p class="note muted">Selecione uma palavra para consultar o vocabulário.</p>
    ${translations[book] ? `<p class="note muted">Livro I · glosas palavra por palavra nos versos 1–${(wordGlosses[book]?.length ?? 0) + 6} e tradução alinhada nos versos 7–${translations[book].length + 6}.</p>` : ''}
    <div class="layout">
      <section class="verses" aria-label="Texto latino"></section>
      <aside class="sidebar"><section class="panel"><h2>Vocabulário</h2><div id="entry" aria-live="polite">Selecione uma palavra.</div></section></aside>
    </div>
    <p class="note muted">Lemas e análise do <a href="https://github.com/CIRCSE/LASLA">LASLA via LiLa</a>. Verbetes de <a href="https://doi.org/10.5281/zenodo.13989172">Fonseca, Cardoso e Velez, edição digital de Lucas Consolin Dezotti</a>. Formas latinas de <a href="https://github.com/PerseusDL/lexica">Lewis &amp; Short, edição digital do Perseus</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>). Dados de LiLa adaptados sob <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
    <dialog aria-labelledby="dialog-title"><form method="dialog"><button class="control">Fechar</button></form><h2 id="dialog-title">Vocabulário</h2><div id="mobile-entry"></div></dialog>`;
  const dialog = app.querySelector('dialog');
  const verses = app.querySelector('.verses');
  const mobile = matchMedia('(max-width: 760px)');
  let selected;
  const passagesByEnd = new Map(Object.entries(readingPassages[book] ?? {})
    .map(([start, [end, prose]]) => [end, [start, prose]]));
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
      const parts = annotations[index]?.[position];
      const definition = entries[parts?.[0]?.[3]]?.[2][0];
      const shortDefinition = definition?.split(/[,.;]/)[0]?.trim();
      const translation = gloss?.[0] ?? wordGlosses[book]?.[verse - (book === 1 ? 7 : 1)]?.[position];
      if (translation || shortDefinition) word.append(element('small', translation ?? shortDefinition));
      word.addEventListener('click', () => {
        selected?.setAttribute('aria-pressed', 'false');
        word.setAttribute('aria-pressed', 'true');
        selected = word;
        for (const selector of ['#entry', '#mobile-entry']) {
          dictionaryEntry(app.querySelector(selector), form, gloss, book, verse, parts, entries, translation);
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
    const passage = passagesByEnd.get(verse);
    if (passage) {
      const [firstVerse, prose] = passage;
      const paragraph = element('p', prose, 'translation');
      paragraph.prepend(element('strong', `${firstVerse}–${verse} · `));
      verses.append(paragraph);
    }
  });
}

try {
  const response = await fetch(new URL('./georgicas.json', import.meta.url));
  if (!response.ok) throw new Error(response.status);
  books = await response.json();
  try {
    const forms = await fetch(new URL('./formas-dicionario.json', import.meta.url));
    if (forms.ok) dictionaryForms = await forms.json();
  } catch {
    // The Portuguese entries can still be used without the additional forms.
  }
  await render();
  addEventListener('hashchange', async () => {
    await render();
    scrollTo(0, 0);
  });
} catch {
  app.textContent = 'O catálogo não pôde ser carregado. Recarregue a página para tentar novamente.';
}
