import { runQuery } from '../../lib/db';
import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
    try {
        const { question } = await request.json();

        // Step 1: find which known service the question mentions
        const serviceRecords = await runQuery(`MATCH (s:Service) RETURN s.name AS name`);
        const serviceNames = serviceRecords.map(r => r.get('name'));
        const mentioned = serviceNames.find(name =>
            question.toLowerCase().includes(name.toLowerCase())
        );

        if (!mentioned) {
            return NextResponse.json({
                answer: "I couldn't find a specific service in your question. Try naming one, e.g. \"why is Checkout down?\""
            });
        }

        // Query A: the source service's own status + any incident directly on it
        const sourceRecords = await runQuery(
            `MATCH (source:Service {name: $serviceName})
   OPTIONAL MATCH (i:Incident)-[:AFFECTED]->(source)
   RETURN source.status AS sourceStatus, i.title AS incidentTitle`,
            { serviceName: mentioned }
        );

        const sourceStatus = sourceRecords[0]?.get('sourceStatus') || 'unknown';
        const incidentTitle = sourceRecords[0]?.get('incidentTitle');

        // Query B: downstream blast radius — same proven query from Step 7
        const affectedRecords = await runQuery(
            `MATCH (source:Service {name: $serviceName})<-[:DEPENDS_ON*1..5]-(affected:Service)
   OPTIONAL MATCH (owner:Engineer)-[:OWNS]->(affected)
   RETURN DISTINCT affected.name AS affectedService, collect(DISTINCT owner.name) AS owners`,
            { serviceName: mentioned }
        );

        const affected = affectedRecords.map(r => r.get('affectedService')).filter(Boolean);
        const owners = [
            ...new Set(affectedRecords.flatMap(r => r.get('owners')).filter(Boolean))
        ];

        // Step 3: hand these real facts to the LLM, just to phrase them naturally
        const factsSummary = `
Service in question: ${mentioned}
Current status of this service: ${sourceStatus}
Known incident on it: ${incidentTitle || 'none currently logged'}
Downstream services that depend on it (would be affected): ${affected.join(', ') || 'none'}
Engineers who own the affected services: ${owners.join(', ') || 'unassigned'}
    `.trim();

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `
You are an incident-response assistant for a service dependency graph.

You are given facts retrieved directly from the graph database. Your job is to explain those facts clearly in 2-4 concise sentences.

Rules:
1. Treat the provided graph facts as the source of truth.
2. Never invent or assume service names, statuses, incidents, owners, dependencies, or causes.
3. Never treat an assumption in the user's question as a fact.
4. If the user's question conflicts with the graph data, explicitly point out the conflict.
5. If a service is healthy, clearly state that it is healthy.
6. If no incident is logged, clearly state that no incident is currently logged.
7. Do not speculate about the root cause.
8. If the graph does not contain enough information to answer "why", say that there is not enough information in the graph to determine the cause.
9. Only mention downstream services, owners, or incidents if they are present in the provided facts.
10. Do not provide troubleshooting recommendations or suggest investigating another service unless the provided graph facts explicitly support that recommendation.
11. Keep the answer professional, concise, and easy to understand.
`
                },
                {
                    role: 'user',
                    content: `Question: "${question}"\n\nFacts from the graph:\n${factsSummary}`
                }
            ]
        });

        const answer = completion.choices[0].message.content;
        return NextResponse.json({ answer, factsUsed: { mentioned, sourceStatus, affected, owners, incidentTitle } });
    } catch (error) {
        console.error('Explain error:', error.message);
        return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
    }
}