import { runQuery } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const records = await runQuery(
      `MATCH (i:Incident)-[:CAUSED_BY]->(dep:Deployment)-[:DEPLOYED_TO]->(rootService:Service)
       MATCH (i)-[:AFFECTED]->(directlyAffected:Service)
       OPTIONAL MATCH (rootService)<-[:DEPENDS_ON*1..5]-(downstream:Service)
       OPTIONAL MATCH (owner:Engineer)-[:OWNS]->(rootService)
       RETURN i.title AS title,
              i.severity AS severity,
              i.resolved AS resolved,
              dep.version AS badDeployment,
              rootService.name AS rootCause,
              owner.name AS rootOwner,
              collect(DISTINCT downstream.name) AS atRiskServices`
    );

    const incidents = records.map(r => ({
      title: r.get('title'),
      severity: r.get('severity'),
      resolved: r.get('resolved'),
      badDeployment: r.get('badDeployment'),
      rootCause: r.get('rootCause'),
      rootOwner: r.get('rootOwner'),
      atRiskServices: r.get('atRiskServices')
    }));

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('DB error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}