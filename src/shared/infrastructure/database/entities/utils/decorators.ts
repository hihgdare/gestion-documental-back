import { Column, ColumnOptions } from 'typeorm';

interface EnumColumnOptions extends Omit<ColumnOptions, 'type'> {
  enum: (string | number)[];
}

export function EnumColumn(options: EnumColumnOptions) {
  const dbType = process.env.DB_TYPE;
  const supportEnum = dbType !== 'sqljs' && dbType !== 'sqlite' && dbType !== 'better-sqlite3';

  return Column({
    ...options,
    type: supportEnum ? 'enum' : 'simple-enum',
  });
}
