'use client';

import { useEffect, useState } from 'react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load incidents');
        return res.json();
      })
      .then(data => setIncidents(data.incidents))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading incidents...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Active Incidents</h1>

      {incidents.length === 0 && (
        <div className="text-gray-400">No incidents right now. All systems healthy.</div>
      )}

      <div className="space-y-4">
        {incidents.map(inc => (
          <div key={inc.title} className="border border-orange-200 bg-orange-50 rounded p-5">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{inc.title}</h2>
              <span className={`text-xs px-2 py-1 rounded ${inc.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {inc.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              Root cause: <span className="font-medium">{inc.badDeployment}</span> deployed to{' '}
              <span className="font-medium">{inc.rootCause}</span> (owner: {inc.rootOwner})
            </p>
            {inc.atRiskServices.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                At risk if unresolved: {inc.atRiskServices.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}