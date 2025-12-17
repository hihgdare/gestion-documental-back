import { Column, ColumnOptions } from 'typeorm';

interface EnumColumnOptions extends Omit<ColumnOptions, 'type'> {
  enum: (string | number)[];
}

export function EnumColumn(options: EnumColumnOptions) {
  if (process.env.DB_TYPE !== 'sqljs') {
    return Column({ type: 'enum', ...options });
  }
  // sqljs does not support enum types, so we simulate it
  const length = options.enum.reduce((max: number, val) => Math.max(max, String(val).length), 0) || 5;
  const { enum: _enum, ...rest } = options as any;
  return Column({
    type: 'varchar',
    ...rest,
    length,
    default: String(options.default) || String(options.enum[0]),
  });
}
