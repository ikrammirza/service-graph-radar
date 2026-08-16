import neo4j from 'neo4j-driver';

let driver;

export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      process.env.COGNODB_URI,
      neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
    );
  }
  return driver;
}

export async function runQuery(cypher, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}