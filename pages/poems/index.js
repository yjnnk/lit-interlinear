import Link from 'next/link';

export default function Poems() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-12 text-gray-800">Corpus Poeticum</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-serif mb-2 text-gray-700">Virgílio</h2>
          <p className="text-gray-600 mb-4">Bucólicas</p>
          <ul className="space-y-2">
            <li className="border border-ink-black p-2 hover:bg-accent-red hover:text-old-paper transition-colors duration-200">
              <Link href="/poems/virgil/ecloga_I">
                Écloga I
              </Link>
            </li>
            <li className="border border-ink-black p-2 hover:bg-accent-red hover:text-old-paper transition-colors duration-200">
              <Link href="/poems/virgil/ecloga_VII">
                Écloga VII
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}