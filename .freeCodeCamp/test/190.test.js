const assert = require('assert');
const { Client } = require('pg');

const database = 'bikes';
const connectionString = `postgresql://postgres@localhost:5432/${database}`;
const client = new Client({
  connectionString: connectionString,
});

describe('The "customers" table', () => {
  it('should have a column named "phone" with the correct properties', async () => {
    const query1 = `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'public' AND is_nullable = 'NO' AND table_name = 'customers' AND column_name = 'phone' AND data_type = 'character varying' AND character_maximum_length = 15;`;
    const query2 = `SELECT tc.table_schema, tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'UNIQUE';`;

    try {
      await client.connect();
      const res1 = await client.query(query1);
      const res2 = await client.query(query2);

      const uniqueColumn = res2.rows.findIndex(column => {
        return column.table_name === 'customers' && column.column_name === 'phone';
      });
      
      assert(res1.rows.length >= 1 && uniqueColumn >= 0);
    } catch (err) {
      assert(false);
    } finally {
      await client.end();
    }
  });
});
