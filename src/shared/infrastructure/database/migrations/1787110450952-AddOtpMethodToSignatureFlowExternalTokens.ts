import { TableColumn } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class AddOtpMethodToSignatureFlowExternalTokens1787110450952 extends ImprovedRunner {
  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.addColumn('signature_flow_external_tokens', new TableColumn({
      name: 'otp_method',
      type: 'varchar',
      length: '10',
      isNullable: true,
      comment: 'email | sms — canal usado para enviar el código al firmante externo',
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropColumn('signature_flow_external_tokens', 'otp_method');
  }
}
