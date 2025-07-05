import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8 bg-white border border-red-200 shadow-sm">
      <h1 className="font-press text-red-700 text-center text-2xl mb-6">
        Glossário Interlinear
      </h1>

      <details open className="mb-4">
        <summary className="cursor-pointer text-lg text-red-800">Virgílio</summary>
        <ul className="list-disc pl-6 mt-2 space-y-1 font-jp">
          <li>
            <Link href="/poems/virgil/bucolics" className="text-blue-700 hover:underline">
              Bucólicas
            </Link>
          </li>
        </ul>
      </details>
    </main>
  );
}
