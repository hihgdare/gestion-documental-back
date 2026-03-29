import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

interface DBDocument {
  id: string;
  document_model_id: string;
  contract_id: string;
  group_id: number;
}

interface DBDocumentHistory {
  id: string;
  document_id: string;
  document_model_id: string;
  document_type_id: string; // before remove it
  document_subtype_id: string; // before remove it
  contract_id: string;
  group_id: number;
}

interface DBDocumentModel {
  id: string;
  document_type_id: string;
  document_subtype_id: string;
}

/**
 * Remover propiedades de documents_history.
 * Agregar: document_model_id
 * Remover: document_type_id, document_subtype_id, required_expiration_date, required_for_colaborator, required_for_contract
 */
export class UpdateDocumentsHistoryStructure1769600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('documents_history');
    if (!table) return;

    // 1. Agregar document_model_id
    await queryRunner?.addColumn('documents_history', new TableColumn({
      name: 'document_model_id',
      type: 'varchar',
      length: '36',
      isNullable: true, // Inicialmente nullable para permitir documentos sin modelos (aunque la req implique reemplazo)
    }));
    // 2. Buscamos todo el historial y actualizamos su document_model_id
    await queryRunner.manager.find<DBDocumentHistory>('documents_history').then(async (histories) => {
      for (const history of histories) {
        // 2.1. Buscar el documento asociado
        const document = await queryRunner.manager.findOne<DBDocument>('documents', {
          where: { id: history.document_id },
        });
        if (document?.id) {
          // 2.2. Actualizar el id del modelo
          await queryRunner.manager.update('documents_history', { id: history.id }, {
            document_model_id: document?.document_model_id,
          });
        } else {
          // 2.3. Si no se puede asignar el documento, borramos el historial
          await queryRunner.manager.delete('documents_history', { id: history.id });
        }
      }
    });

    // 3. Hacer que document_model_id no sea nullable
    await queryRunner.changeColumn('documents_history', 'document_model_id', new TableColumn({
      name: 'document_model_id',
      type: 'varchar',
      length: '36',
      isNullable: false,
    }));
    // 4. Añade la foreign key a la columna document_model_id
    await queryRunner.createForeignKey('documents_history', new TableForeignKey({
      columnNames: ['document_model_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'document_models',
      onDelete: 'RESTRICT',
    }));
    // 6. Remover las foreign keys antiguas primero
    const foreignKeySubtype = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_subtype_id') !== -1);
    if (foreignKeySubtype) {
      await queryRunner.dropForeignKey('documents_history', foreignKeySubtype);
    }
    const foreignKeyType = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_type_id') !== -1);
    if (foreignKeyType) {
      await queryRunner.dropForeignKey('documents_history', foreignKeyType);
    }
    await queryRunner.dropColumns('documents_history', [
      'document_type_id',
      'document_subtype_id',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate columns in documents table
    const table = await queryRunner.getTable('documents_history');
    if (!table) return;

    // 1. Restaurar las columnas antiguas
    await queryRunner.addColumns('documents_history', [
      new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
      new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    ]);
    // 2. Restaurar las foreign keys antiguas primero
    await queryRunner.createForeignKey('documents_history', new TableForeignKey({
      columnNames: ['document_type_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'document_types',
      onDelete: 'RESTRICT',
    }));
    await queryRunner.createForeignKey('documents_history', new TableForeignKey({
      columnNames: ['document_subtype_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'document_subtypes',
      onDelete: 'RESTRICT',
    }));

    // 3. Buscamos todo el historial y actualizamos sus propiedades usando el document_model_id
    const histories = await queryRunner.manager.find('documents_history') as DBDocumentHistory[];
    for (const history of histories) {
      // 3.1. Buscar el modelo de documento asociado
      const documentModel = await queryRunner.manager.findOne<DBDocumentModel>('document_models', {
        where: { id: history.document_model_id },
      });
      // 3.2. Actualizar las propiedades de tipo y subtipo
      await queryRunner.manager.update('documents_history', { id: history.id }, {
        document_type_id: documentModel?.document_type_id,
        document_subtype_id: documentModel?.document_subtype_id,
      });
    }
    // 4. Remover la foreign key a la columna document_model_id
    const foreignKeyModel = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_model_id') !== -1);
    if (foreignKeyModel) {
      await queryRunner.dropForeignKey('documents_history', foreignKeyModel);
    }

    // 5. Eliminar la columna document_model_id
    await queryRunner.dropColumn('documents_history', 'document_model_id');
  }
}
