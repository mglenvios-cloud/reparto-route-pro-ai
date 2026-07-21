const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://club_newbery_db_user:lrxgHEpDkHf8ByTYcu3ICJTOE6n4v86C@dpg-d9dn82jrjlhs73avc5tg-a.virginia-postgres.render.com:5432/club_newbery_db',
});
client.connect()
  .then(() => client.query('CREATE DATABASE route_pro_ai_db'))
  .then(() => console.log('Database created OK'))
  .catch(e => console.log(e.message))
  .finally(() => client.end());
