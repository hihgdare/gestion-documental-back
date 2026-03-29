import { randomUUID } from 'node:crypto';
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

interface WithGroup {
  id: string;
  group_id: number;
}
interface DBDocumentBase extends WithGroup {
  document_type_id: string;
  document_subtype_id: string;
  required_expiration_date: boolean;
  required_for_colaborator: boolean;
  required_for_contract: boolean;
}
interface DBFamily extends WithGroup {
  contract_id: string;
  name: string;
}
interface DBDocumentModel extends DBDocumentBase {
  family_id: string | null;
}
interface DBDocument extends DBDocumentModel {
  contract_id: string;
  document_model_id: string | null;
}

export class UpdateDocumentsStructure1769572000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.getTable('documents').then(async (table) => {
      if (!table) throw new Error('Table documents not found');

      // 1. Agrega columna document_model_id a la tabla documents
      if (!table?.columns.find((c) => c.name === 'document_model_id')) {
        await queryRunner.addColumn('documents', new TableColumn({
          name: 'document_model_id',
          type: 'varchar',
          length: '36',
          isNullable: true, // Inicialmente nullable para permitir documentos sin modelos (aunque la req implique reemplazo)
        }));
      }
      // 2. Buscamos todos los documentos y actualizamos su document_model_id
      const documents = await queryRunner.manager.find<DBDocument>('documents');
      for (const document of documents) {
        // 2.1.1. Buscamos si hay alguna familia que pertenezca al contrato del documento
        let family = await queryRunner.manager.findOne<DBFamily>('families', {
          where: { contract_id: document.contract_id },
        });
        if (!family) {
          // 2.1.2. Si no encontramos la familia, se crea una nueva
          const inserted = await queryRunner.manager.insert<DBFamily>('families', {
            id: randomUUID(),
            contract_id: document.contract_id,
            name: `Family for contract ${document.contract_id}`,
            group_id: document.group_id,
          });
          family = inserted.identifiers[0] as DBFamily;
        }
        // 2.2.1. Buscamos un modelo de documento que tenga los mismos datos
        let documentModel = await queryRunner.manager.createQueryBuilder<DBDocumentModel>('document_models', 'dm')
          .where('dm.document_type_id = :document_type_id', { document_type_id: document.document_type_id })
          .andWhere('dm.document_subtype_id = :document_subtype_id', { document_subtype_id: document.document_subtype_id })
          .andWhere('dm.family_id = :family_id', { family_id: family.id })
          .getOne();
        if (!documentModel) {
          // 2.2.2. Si no encontramos el modelo de documento, se crea uno nuevo
          const inserted = await queryRunner.manager.insert<DBDocumentModel>('document_models', {
            id: randomUUID(),
            document_type_id: document.document_type_id,
            document_subtype_id: document.document_subtype_id,
            family_id: family.id,
            required_expiration_date: document.required_expiration_date,
            required_for_colaborator: document.required_for_colaborator,
            required_for_contract: document.required_for_contract,
          });
          documentModel = inserted.identifiers[0] as DBDocumentModel;
        }
        if (documentModel.id) {
          // 2.3. Actualizamos el document_model_id del documento con el modelo encontrado
          await queryRunner.manager.update('documents', { id: document.id }, { document_model_id: documentModel.id });
        } else {
          // 2.4. Si no se pudo asignar un document_model_id, eliminamos el documento
          await queryRunner.manager.delete('documents', { id: document.id });
        }
      }

      // 3. Hacer que document_model_id no sea nullable
      await queryRunner.changeColumn('documents', 'document_model_id', new TableColumn({
        name: 'document_model_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
      // 4. Añade la foreign key a la columna document_model_id
      await queryRunner.createForeignKey('documents', new TableForeignKey({
        columnNames: ['document_model_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_models',
        onDelete: 'RESTRICT',
      }));
    });

    await queryRunner.getTable('documents').then(async (table) => {
      // 6. Remover las foreign keys antiguas primero
      const foreignKeySubtype = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_subtype_id') !== -1);
      if (foreignKeySubtype) {
        await queryRunner.dropForeignKey('documents', foreignKeySubtype);
      }
      const foreignKeyType = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_type_id') !== -1);
      if (foreignKeyType) {
        await queryRunner.dropForeignKey('documents', foreignKeyType);
      }
      await queryRunner.dropColumns('documents', [
        'document_type_id',
        'document_subtype_id',
        'required_for_contract',
        'required_for_colaborator',
        'required_expiration_date',
      ]);
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Restaurar las columnas antiguas
    await queryRunner.addColumns('documents', [
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
      new TableColumn({
        name: 'required_for_contract',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'required_for_colaborator',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'required_expiration_date',
        type: 'boolean',
        default: false,
      }),
    ]);

    // 2. Restaurar las foreign keys antiguas primero
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        columnNames: ['document_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_types',
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        columnNames: ['document_subtype_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_subtypes',
        onDelete: 'RESTRICT',
      }),
    );

    // 3. Buscamos todos los documentos y actualizamos sus propiedades usando el document_model_id
    const documents = await queryRunner.manager.find('documents') as DBDocument[];
    for (const document of documents) {
      const documentModel = await queryRunner.manager.findOne<DBDocumentModel>('document_models', {
        where: { id: document.document_model_id! },
      });
      if (documentModel) {
        await queryRunner.manager.update('documents', { id: document.id }, {
          document_type_id: documentModel.document_type_id,
          document_subtype_id: documentModel.document_subtype_id,
          required_for_contract: documentModel.required_for_contract,
          required_for_colaborator: documentModel.required_for_colaborator,
          required_expiration_date: documentModel.required_expiration_date,
        });
      }
    }

    // 4. Remover la foreign key a la columna document_model_id
    const table = await queryRunner.getTable('documents');
    const foreignKeyModel = table?.foreignKeys.find(fk => fk.columnNames.indexOf('document_model_id') !== -1);
    if (foreignKeyModel) {
      await queryRunner.dropForeignKey('documents', foreignKeyModel);
    }

    // 5. Eliminar la columna document_model_id
    await queryRunner.dropColumn('documents', 'document_model_id');
  }
}
