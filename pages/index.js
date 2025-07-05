import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8 border shadow-sm">
      <h1 className="text-center text-2xl mb-6">
        Glossário Interlinear e análise sintática
      </h1>

      <details open className="mb-4">
        <summary className="cursor-pointer text-lg text-red-800">Virgílio</summary>
        <ul className=" pl-6 mt-2 space-y-1 font-jp">
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
