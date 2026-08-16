import { runQuery } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const records = await runQuery(
      `MATCH (s:Service) RETURN s.name AS name, s.status AS status, s.criticality AS criticality ORDER BY s.name`
    );

    const services = records.map(r => ({
      name: r.get('name'),
      status: r.get('status'),
      criticality: r.get('criticality')
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('DB error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}