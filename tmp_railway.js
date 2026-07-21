process.chdir('C:\\Users\\Claudio\\Desktop\\REPARTO\\route-pro-ai\\backend');
const axios = require('axios');

const token = '9b117fcc-d807-4c5b-a9f9-4164595aa871';
const url = 'https://backboard.railway.app/graphql/v2';
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

async function gql(query) {
  const res = await axios.post(url, { query }, { headers });
  if (res.data.errors) throw new Error(JSON.stringify(res.data.errors));
  return res.data.data;
}

async function main() {
  console.log('Creating project...');
  const pdata = await gql(`mutation { projectCreate(input: { name: "route-pro-ai-backend", workspaceId: "6230a181-070c-44ac-b6ef-e5b130ae79f1" }) { id name createdAt } }`);
  const projectId = pdata.projectCreate.id;
  console.log('Project ID:', projectId);

  const edata = await gql(`{ project(id: "${projectId}") { environments { edges { node { id name } } } } }`);
  const envId = edata.project.environments.edges.find(e => e.node.name === 'production').node.id;
  console.log('Environment ID:', envId);

  console.log('Creating service...');
  const sdata = await gql(`mutation { serviceCreate(input: { name: "backend", projectId: "${projectId}", environmentId: "${envId}" }) { id name } }`);
  console.log('Service ID:', sdata.serviceCreate.id);

  console.log('Setting variables...');
  await gql(`mutation { variableUpsert(input: { environmentId: "${envId}", projectId: "${projectId}", serviceId: "${sdata.serviceCreate.id}", name: "DATABASE_URL", value: "postgresql://club_newbery_db_user:lrxgHEpDkHf8ByTYcu3ICJTOE6n4v86C@dpg-d9dn82jrjlhs73avc5tg-a.virginia-postgres.render.com:5432/route_pro_ai_db" }) { id } }`);
  await gql(`mutation { variableUpsert(input: { environmentId: "${envId}", projectId: "${projectId}", serviceId: "${sdata.serviceCreate.id}", name: "JWT_SECRET", value: "route-pro-ai-jwt-secret-2026" }) { id } }`);
  await gql(`mutation { variableUpsert(input: { environmentId: "${envId}", projectId: "${projectId}", serviceId: "${sdata.serviceCreate.id}", name: "NODE_ENV", value: "production" }) { id } }`);

  console.log('Done! Project created on Railway.');
  console.log('Project ID:', projectId);
  console.log('Deploy via: railway --service backend up');
}

main().catch(e => console.error('Error:', e.message));
