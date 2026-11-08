import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page narrow">
      <h1>Бет табылмады</h1>
      <p>Сілтеме қате немесе шақыру әлі жарияланбаған.</p>
      <p><Link href="/">Басты бет</Link></p>
    </main>
  );
}
