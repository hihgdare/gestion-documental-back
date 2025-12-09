const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', '..', 'src', 'shared', 'infrastructure', 'database', 'migrations');
const entitiesDir = path.join(__dirname, '..', '..', 'src', 'shared', 'infrastructure', 'database', 'entities');

function extractColumnsFromMigration(content) {
  const cols = [];
  // Find start of columns array in the new Table definition
  // We look for "columns: ["
  const colStartRegex = /columns:\s*\[/g;
  const match = colStartRegex.exec(content);
  if (!match) return cols;

  const start = match.index + match[0].length;
  let depth = 1;
  let i = start;

  // Advance until we find the closing bracket for the columns array
  while (i < content.length && depth > 0) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') depth--;
    i++;
  }

  if (depth !== 0) return cols; // Malformed or incomplete

  const columnsSection = content.substring(start, i - 1);

  // Capture column names: name: 'foo' or name: "foo"
  const nameRegex = /name:\s*['"]([a-zA-Z0-9_]+)['"]/g;
  let m;
  while ((m = nameRegex.exec(columnsSection))) {
    cols.push(m[1]);
  }
  return cols;
}

function extractColumnsFromEntity(content) {
  const cols = new Set();
  const normalize = s => s.replace(/([A-Z])/g, '_$1').toLowerCase();

  // Match decorators and property names
  // Capture group 1: Decorators block
  // Capture group 2: Property name
  // This regex assumes decorators and property are relatively close and handles basic parenthesis balancing for decorators
  const propRegex = /((?:@[a-zA-Z0-9_]+(?:\([^)]*\))?\s*)+)\s*([a-zA-Z0-9_]+)\s*[:!?]/g;

  let m;
  while ((m = propRegex.exec(content))) {
    const decorators = m[1];
    const propName = m[2];

    // Check if it's a column-generating decorator
    if (
      decorators.includes('@Column') ||
      decorators.includes('@PrimaryGeneratedColumn') ||
      decorators.includes('@CreateDateColumn') ||
      decorators.includes('@UpdateDateColumn') ||
      decorators.includes('@DeleteDateColumn') ||
      decorators.includes('@EnumColumn') ||
      decorators.includes('@JoinColumn')
    ) {
      // Look for explicit name
      const nameMatch = decorators.match(/name:\s*['"]([^'"]+)['"]/);
      if (nameMatch) {
        cols.add(nameMatch[1]);
      } else {
        // Fallback to snake_case property name
        cols.add(normalize(propName));
      }
    }
  }

  return Array.from(cols);
}

const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.ts'));
const entityFiles = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.ts'));

const migrationsMap = {};
for (const mf of migrationFiles) {
  const content = fs.readFileSync(path.join(migrationsDir, mf), 'utf8');
  const tableMatch = content.match(/name:\s*'([a-z0-9_]+)'/i);
  const tableName = tableMatch ? tableMatch[1] : mf;
  migrationsMap[tableName] = { file: mf, cols: extractColumnsFromMigration(content) };
}

const entitiesMap = {};
for (const ef of entityFiles) {
  const content = fs.readFileSync(path.join(entitiesDir, ef), 'utf8');
  // table name from @Entity('name')
  const tableMatch = content.match(/@Entity\(['`]([a-z0-9_]+)['`]\)/i);
  const tableName = tableMatch ? tableMatch[1] : ef.replace('.ts', '');
  entitiesMap[tableName] = { file: ef, cols: extractColumnsFromEntity(content) };
}

const report = [];
for (const [table, ent] of Object.entries(entitiesMap)) {
  const mig = migrationsMap[table];
  if (!mig) {
    report.push({ table, issue: 'no_migration', entityColumns: ent.cols, migrationColumns: [] });
    continue;
  }
  const missingInMig = ent.cols.filter(c => !mig.cols.includes(c));
  const extraInMig = mig.cols.filter(c => !ent.cols.includes(c));
  if (missingInMig.length || extraInMig.length) {
    report.push({ table, issue: 'mismatch', missingInMigration: missingInMig, extraInMigration: extraInMig, migrationFile: mig.file, entityFile: ent.file });
  }
}

// also report migrations without entities
for (const [table, mig] of Object.entries(migrationsMap)) {
  if (!entitiesMap[table]) {
    report.push({ table, issue: 'no_entity', migrationColumns: mig.cols, migrationFile: mig.file });
  }
}

const args = process.argv.slice(2);
const ignoreNoEntity = args.includes('--ignore-no-entity');
const ignoreNoMigration = args.includes('--ignore-no-migration');

const finalReport = report.filter(item => {
  if (ignoreNoEntity && item.issue === 'no_entity') return false;
  if (ignoreNoMigration && item.issue === 'no_migration') return false;
  return true;
});

console.log(JSON.stringify(finalReport, null, 2));
