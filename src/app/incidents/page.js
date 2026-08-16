'use client';

import { useEffect, useState } from 'react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await fetch('/api/incidents', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to load incidents');
      }

      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const highSeverityCount = incidents.filter(
    (incident) => incident.severity === 'high'
  ).length;

  const systemHealthy = incidents.length === 0;

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high':
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          dot: 'bg-red-500',
          border: 'border-l-red-500',
          icon: 'bg-red-50 text-red-600',
        };

      case 'medium':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          border: 'border-l-amber-500',
          icon: 'bg-amber-50 text-amber-600',
        };

      default:
        return {
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          border: 'border-l-blue-500',
          icon: 'bg-blue-50 text-blue-600',
        };
    }
  };

  /* Loading State */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="mb-8">
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-200" />
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

        </div>
      </main>
    );
  }

  /* Error State */
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-red-900">
                  Unable to load incidents
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  onClick={() => fetchIncidents()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Try again
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Incidents
                </h1>

              </div>

              <p className="text-sm text-slate-500">
                Monitor active incidents and system health in real time.
              </p>

            </div>

            <button
              onClick={() => fetchIncidents(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <svg
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>

              {refreshing ? 'Refreshing...' : 'Refresh'}

            </button>

          </div>

        </header>

        {/* System Status */}
        <section
          className={`mb-6 overflow-hidden rounded-2xl border ${
            systemHealthy
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >

          <div className="flex items-center gap-4 px-5 py-4">

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                systemHealthy
                  ? 'bg-emerald-100'
                  : 'bg-amber-100'
              }`}
            >
              <span
                className={`h-3 w-3 animate-pulse rounded-full ${
                  systemHealthy
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>

            <div>

              <h2
                className={`font-semibold ${
                  systemHealthy
                    ? 'text-emerald-900'
                    : 'text-amber-900'
                }`}
              >
                {systemHealthy
                  ? 'All systems operational'
                  : 'Some systems need attention'}
              </h2>

              <p
                className={`mt-0.5 text-sm ${
                  systemHealthy
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {systemHealthy
                  ? 'No active incidents have been reported.'
                  : `${incidents.length} active ${
                      incidents.length === 1
                        ? 'incident'
                        : 'incidents'
                    } currently being monitored.`}
              </p>

            </div>

          </div>

        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">

          {/* Active incidents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active incidents
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {incidents.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                ⚠
              </div>

            </div>
          </div>

          {/* High severity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  High severity
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {highSeverityCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                !
              </div>

            </div>
          </div>

          {/* System status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  System status
                </p>

                <p
                  className={`mt-2 text-lg font-bold ${
                    systemHealthy
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {systemHealthy ? 'Healthy' : 'Degraded'}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

            </div>
          </div>

        </section>

        {/* Incident list */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Active incidents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current issues affecting your services.
              </p>
            </div>

            {incidents.length > 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {incidents.length}{' '}
                {incidents.length === 1
                  ? 'incident'
                  : 'incidents'}
              </span>
            )}

          </div>

          {/* Empty state */}
          {incidents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                ✓
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No active incidents
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Everything looks good. There are currently no
                reported incidents affecting your systems.
              </p>

            </div>
          ) : (

            <div className="space-y-4">

              {incidents.map((incident, index) => {

                const styles = getSeverityStyles(
                  incident.severity
                );

                return (
                  <article
                    key={`${incident.title}-${index}`}
                    className={`group overflow-hidden rounded-2xl border border-slate-200 border-l-4 ${styles.border} bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >

                    <div className="p-5 sm:p-6">

                      {/* Header */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex gap-4">

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                          >
                            ⚠
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                {incident.title}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles.badge}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                                />

                                {incident.severity}
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              Active incident
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Root Cause */}
                      <div className="mt-6 rounded-xl bg-slate-50 p-4">

                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Root cause
                        </p>

                        <div className="grid gap-4 sm:grid-cols-3">

                          <div>
                            <p className="text-xs text-slate-400">
                              Deployment
                            </p>

                            <p className="mt-1 break-words text-sm font-medium text-slate-800">
                              {incident.badDeployment}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Affected area
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {incident.rootCause}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Owner
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {incident.rootOwner}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* At risk services */}
                      {incident.atRiskServices?.length > 0 && (
                        <div className="mt-5">

                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            At-risk services
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {incident.atRiskServices.map(
                              (service) => (
                                <span
                                  key={service}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                                >
                                  {service}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                      <span>
                        Incident requires monitoring until resolved.
                      </span>

                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">

                        <span
                          className={`h-2 w-2 animate-pulse rounded-full ${styles.dot}`}
                        />

                        Monitoring

                      </span>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Incident status is updated automatically. Last checked just now.
        </footer>

      </div>

    </main>
  );
}