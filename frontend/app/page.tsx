export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  let status = "unknown";

  try {
    const res = await fetch(`${apiUrl}/api/health/`, {
      cache: "no-store",
    });

    const data = await res.json();
    status = data.status;
  } catch {
    status = "backend unreachable";
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">Lunador</h1>
      <p className="mt-4 text-lg">Personal blog/shop experiment.</p>
      <p className="mt-4">Backend status: {status}</p>
    </main>
  );
}