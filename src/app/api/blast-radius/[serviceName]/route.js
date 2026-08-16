import { runQuery } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { serviceName } = await params;

  try {
    const records = await runQuery(
      `MATCH (source:Service {name: $serviceName})<-[:DEPENDS_ON*1..5]-(affected:Service)
       OPTIONAL MATCH (owner:Engineer)-[:OWNS]->(affected)
       RETURN DISTINCT affected.name AS service,
              affected.criticality AS criticality,
              affected.status AS status,
              collect(DISTINCT owner.name) AS owners`,
      { serviceName }
    );

    const affected = records.map(r => ({
      service: r.get('service'),
      criticality: r.get('criticality'),
      status: r.get('status'),
      owners: r.get('owners')
    }));

    return NextResponse.json({ source: serviceName, affected });
  } catch (error) {
    console.error('DB error:', error.message);
    return NextResponse.json({ error: 'Failed to compute blast radius' }, { status: 500 });
  }
}