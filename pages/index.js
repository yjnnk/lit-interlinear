import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Glossário Interlinear e análise sintática</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/poems/virgil/bucolics">
            Virgílio – Bucólicas
          </Link>
        </li>
      </ul>
    </main>
  );
}
