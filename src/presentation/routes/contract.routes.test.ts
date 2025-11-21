/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
import { DateUtils } from '@shared/utils/date';

describe('ContractController', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  let id = 1;
  const getNewId = () => `CN-TEST-${id++}`;

  describe('/api/contracts', () => {
    const startDate = DateUtils.todayString();
    const endDate = futureDate(startDate);

    function futureDate(date: DateType): string {
      return DateUtils.toString(DateUtils.addMonths(date, 1));
    }

    const baseContractDto = {
      contractNumber: '',
      rutSociedad: '12.345.678-5',
      nombreColaborador: 'Juan Perez',
      administradorContratoMandante: 'Admin Mandante',
      administradorContratoEmpresa: 'Admin Empresa',
      rutAdministradorContrato: '23.456.789-6',
      nombreMandante: 'Mandante SA',
      startDate,
      endDate,
      contractType: ContractType.CONSULTORIA,
      jornadaTrabajo: JornadaTrabajo.COMPLETA,
      division: 'Division Test',
      area: 'Area Test',
      descripcionServicio: 'Servicio de prueba',
      nombreProyecto: 'Proyecto Test',
    };

    it('should create a new contract and return 201', async () => {
      baseContractDto.contractNumber = getNewId();
      const response = await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contract created successfully');
      expect(response.body.data.id).toBeString();
      expect(response.body.data).toMatchObject({
        rutSociedad: baseContractDto.rutSociedad,
        nombreColaborador: baseContractDto.nombreColaborador,
        contractNumber: baseContractDto.contractNumber,
        startDate,
        endDate,
      });
    });

    it('should update a contract', async () => {
      baseContractDto.contractNumber = getNewId();
      const createResponse = await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      const createdId = createResponse.body.data.id as string;
      const startDate = createResponse.body.data.startDate as string;
      const originalEndDate = createResponse.body.data.endDate as string;

      const newEndDate = futureDate(originalEndDate);
      const descripcionServicio = 'Servicio actualizado';
      const dotacionPersonal = 5;
      const dotacionVehiculos = 2;

      const updateResponse = await supertest(app)
        .put(`/api/contracts/${createdId}`)
        .send({
          endDate: newEndDate,
          descripcionServicio,
          dotacionPersonal,
          dotacionVehiculos,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.message).toBe('Contract updated successfully');
      expect(updateResponse.body.data).toMatchObject({
        startDate,
        endDate: newEndDate,
        descripcionServicio,
        dotacionPersonal,
        dotacionVehiculos,
      });
    });

    it('should get contract by id and return 200', async () => {
      baseContractDto.contractNumber = getNewId();

      const createResponse = await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      const id = createResponse.body.data.id;

      const response = await supertest(app)
        .get(`/api/contracts/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(id);
      expect(response.body.body).not.toBeDefined();
      expect(response.body.data.startDate).toBe(startDate);
      expect(response.body.data.endDate).toBe(endDate);
    });

    it('should return 409 if contract number already exists', async () => {
      baseContractDto.contractNumber = getNewId();
      // Create the contract first
      await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      // Try to create another contract with the same contract number
      const response = await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a contract and return 200', async () => {
      baseContractDto.contractNumber = getNewId();
      // Create contract first
      const createResponse = await supertest(app)
        .post('/api/contracts')
        .send(baseContractDto);

      const contractId = createResponse.body.data.id;

      const response = await supertest(app)
        .delete(`/api/contracts/${contractId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contract deleted successfully');
    });

    it('should return 400 if validation fails', async () => {
      const invalidDto = { rutSociedad: '' };

      const response = await supertest(app)
        .post('/api/contracts')
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
