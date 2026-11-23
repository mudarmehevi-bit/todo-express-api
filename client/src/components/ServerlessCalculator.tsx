import { FormEvent, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ServerlessCalculator() {
  const [firstNumber, setFirstNumber] = useState<string>('');
  const [secondNumber, setSecondNumber] = useState<string>('');
  const [operation, setOperation] = useState<string>('add');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (firstNumber.trim() === '' || secondNumber.trim() === '') {
      setError('Both numbers are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/calc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          a: Number(firstNumber),
          b: Number(secondNumber),
          operation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to calculate result.');
        return;
      }

      setResult(data.result);
    } catch {
      setError('Network error while reaching /api/calc.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="calc-heading">
      <h2 id="calc-heading">Serverless Calculator</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="num-a">First Number</label>
          <input
            id="num-a"
            type="number"
            step="any"
            value={firstNumber}
            onChange={(e) => setFirstNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="num-b">Second Number</label>
          <input
            id="num-b"
            type="number"
            step="any"
            value={secondNumber}
            onChange={(e) => setSecondNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="calc-op">Operation</label>
          <select
            id="calc-op"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}

      {result !== null && !error && (
        <p aria-live="polite">
          Result: <strong>{result}</strong>
        </p>
      )}
    </section>
  );
}
