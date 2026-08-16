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
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await fetch('/api/services', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to load services');
      }

      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSelect = async (serviceName) => {
    setSelected(serviceName);
    setBlastLoading(true);
    setBlastRadius(null);

    try {
      const res = await fetch(
        `/api/blast-radius/${encodeURIComponent(serviceName)}`
      );

      if (!res.ok) {
        throw new Error('Failed to calculate blast radius');
      }

      const data = await res.json();
      setBlastRadius(data.affected || []);
    } catch (err) {
      setBlastRadius([]);
    } finally {
      setBlastLoading(false);
    }
  };

  const getCriticalityStyles = (criticality) => {
    const value = String(criticality || '').toLowerCase();

    if (value === 'critical' || value === 'high') {
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
      };
    }

    if (value === 'medium') {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }

    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  };

  const criticalServices = services.filter((service) => {
    const value = String(service.criticality || '').toLowerCase();
    return value === 'critical' || value === 'high';
  }).length;

  /* Loading */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="mb-8">
            <div className="h-9 w-80 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="h-5 w-32 rounded bg-slate-200" />

              <div className="mt-5 space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-16 rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            </div>

            <div className="h-96 rounded-2xl bg-white shadow-sm" />

          </div>
        </div>
      </main>
    );
  }

  /* Error */
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-900">
                  Unable to load services
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  onClick={() => fetchServices()}
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

      <div className="mx-auto max-w-7xl">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <header className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">

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
                      d="M8 9h8M8 13h5m-7 7l-3 1 1-3.5A8 8 0 014 12c0-4.418 3.582-8 8-8h1c4.418 0 8 3.582 8 8s-3.582 8-8 8H8z"
                    />
                  </svg>

                </div>

                <div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Service Dependency Explorer
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Understand your service architecture and analyze
                    downstream impact.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <a
                href="/incidents"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>View Active Incidents</span>

                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>

              <button
                onClick={() => fetchServices(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <svg
                  className={`h-4 w-4 ${
                    refreshing ? 'animate-spin' : ''
                  }`}
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

          </div>

        </header>

        {/* =========================================================
            OVERVIEW STATS
        ========================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">

          {/* Total services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total services
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {services.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

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
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>

              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Registered services in your architecture
            </p>

          </div>

          {/* Critical services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Critical services
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {criticalServices}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                !
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              High-impact services requiring attention
            </p>

          </div>

          {/* Architecture status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Architecture
                </p>

                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-emerald-600">

                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

                  Connected

                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Dependency graph is available
            </p>

          </div>

        </section>

        {/* =========================================================
            MAIN EXPLORER
        ========================================================= */}

        <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">

          {/* =======================================================
              SERVICES SIDEBAR
          ======================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-semibold text-slate-900">
                    Services
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select a service to analyze its impact.
                  </p>

                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {services.length}
                </span>

              </div>

            </div>

            <div className="max-h-[620px] overflow-y-auto p-3">

              {services.length === 0 ? (

                <div className="px-4 py-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    —
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No services found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your service registry is empty.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {services.map((service) => {

                    const styles = getCriticalityStyles(
                      service.criticality
                    );

                    const isSelected =
                      selected === service.name;

                    return (
                      <button
                        key={service.name}
                        onClick={() =>
                          handleSelect(service.name)
                        }
                        className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-3">

                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >

                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M5 12h14M12 5v14"
                                />
                              </svg>

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-800">
                                {service.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Service dependency node
                              </p>

                            </div>

                          </div>

                          <svg
                            className={`h-4 w-4 shrink-0 transition ${
                              isSelected
                                ? 'text-blue-500'
                                : 'text-slate-300 group-hover:text-slate-500'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>

                        </div>

                        <div className="mt-3">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />

                            {service.criticality || 'unknown'}

                          </span>

                        </div>

                      </button>
                    );
                  })}

                </div>

              )}

            </div>

          </div>

          {/* =======================================================
              BLAST RADIUS
          ======================================================= */}

          <div className="min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Panel header */}
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Dependency analysis
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Blast Radius
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Identify services affected if a dependency
                    becomes unavailable.
                  </p>

                </div>

                {selected && (
                  <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
                    Selected: {selected}
                  </span>
                )}

              </div>

            </div>

            {/* Panel body */}
            <div className="p-5 sm:p-6">

              {/* Nothing selected */}
              {!selected && (

                <div className="flex min-h-[380px] flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"
                      />
                    </svg>

                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    Select a service
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Choose a service from the list to calculate
                    which downstream services could be affected
                    by an outage.
                  </p>

                </div>

              )}

              {/* Loading */}
              {selected && blastLoading && (

                <div className="flex min-h-[380px] flex-col items-center justify-center">

                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-5 text-sm font-medium text-slate-700">
                    Calculating blast radius
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Analyzing downstream dependencies...
                  </p>

                </div>

              )}

              {/* No downstream services */}
              {selected &&
                !blastLoading &&
                blastRadius &&
                blastRadius.length === 0 && (

                  <div className="flex min-h-[380px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ✓
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                      No downstream impact
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      No downstream services depend on{' '}
                      <span className="font-semibold text-slate-700">
                        {selected}
                      </span>
                      . An outage would not propagate further
                      through the dependency graph.
                    </p>

                  </div>

                )}

              {/* Blast radius results */}
              {selected &&
                !blastLoading &&
                blastRadius &&
                blastRadius.length > 0 && (

                  <div>

                    {/* Impact summary */}
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          !
                        </div>

                        <div>

                          <p className="font-semibold text-red-900">
                            Potential service impact detected
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            If{' '}
                            <span className="font-semibold">
                              {selected}
                            </span>{' '}
                            goes down,{' '}
                            <span className="font-semibold">
                              {blastRadius.length}
                            </span>{' '}
                            downstream{' '}
                            {blastRadius.length === 1
                              ? 'service may'
                              : 'services may'}{' '}
                            be affected.
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Results */}
                    <div>

                      <div className="mb-3 flex items-center justify-between">

                        <h3 className="text-sm font-semibold text-slate-900">
                          Affected services
                        </h3>

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {blastRadius.length} affected
                        </span>

                      </div>

                      <div className="space-y-3">

                        {blastRadius.map((item, index) => (

                          <div
                            key={`${item.service}-${index}`}
                            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:bg-red-50/30"
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.service}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Downstream dependency
                                  </p>

                                </div>

                              </div>

                              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                                At risk
                              </span>

                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-3">

                              <p className="text-xs font-medium text-slate-400">
                                Owners
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {item.owners?.join(', ') ||
                                  'Unassigned'}
                              </p>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>

                  </div>

                )}

            </div>

          </div>

        </section>

        {/* =========================================================
            EXPLAIN BOX
        ========================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-slate-900">
              AI Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Get an explanation of service dependencies and
              potential failure impact.
            </p>

          </div>

          <ExplainBox />

        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          Service dependency data is loaded from your current
          architecture registry.
        </footer>

      </div>

    </main>
  );
}