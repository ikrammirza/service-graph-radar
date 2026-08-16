'use client';

import { useEffect, useState } from 'react';
import ExplainBox from './components/ExplainBox';
export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [blastRadius, setBlastRadius] = useState(null);
  const [blastLoading, setBlastLoading] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load services');
        return res.json();
      })
      .then(data => setServices(data.services))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (serviceName) => {
    setSelected(serviceName);
    setBlastLoading(true);
    setBlastRadius(null);
    try {
      const res = await fetch(`/api/blast-radius/${serviceName}`);
      const data = await res.json();
      setBlastRadius(data.affected);
    } catch (err) {
      setBlastRadius([]);
    } finally {
      setBlastLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading services...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Service Dependency Explorer</h1>
      <a href="/incidents" className="text-blue-600 text-sm underline mb-6 inline-block">
        View Active Incidents →
      </a>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3 text-gray-700">Services</h2>
          <ul className="space-y-2">
            {services.map(s => (
              <li key={s.name}>
                <button
                  onClick={() => handleSelect(s.name)}
                  className={`w-full text-left px-4 py-2 rounded border ${selected === s.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({s.criticality})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold mb-3 text-gray-700">
            {selected ? `If "${selected}" goes down:` : 'Select a service'}
          </h2>

          {blastLoading && <div className="text-gray-400">Calculating blast radius...</div>}

          {!blastLoading && blastRadius && blastRadius.length === 0 && (
            <div className="text-gray-400">No downstream services depend on this one.</div>
          )}

          {!blastLoading && blastRadius && blastRadius.length > 0 && (
            <ul className="space-y-2">
              {blastRadius.map(b => (
                <li key={b.service} className="px-4 py-2 rounded border border-red-200 bg-red-50">
                  <div className="font-medium">{b.service}</div>
                  <div className="text-xs text-gray-600">
                    Owners: {b.owners.join(', ') || 'unassigned'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ExplainBox />
    </main>
  );
}