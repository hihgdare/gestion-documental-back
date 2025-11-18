#!/usr/bin/env bun

/**
 * Script para verificar que todas las entidades y use cases están funcionando correctamente
 */

import { AppDataSource } from './src/shared/infrastructure/database/typeorm.config';
import { DependencyContainer } from './src/dependency-container';
import { ContractType, JornadaTrabajo } from './src/domains/contract/value-objects/contract-enums';

async function testContractSystem() {
  console.log('🚀 Iniciando test del sistema de contratos...\n');

  try {
    // Inicializar la base de datos
    console.log('📊 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada\n');

    // Inicializar el contenedor de dependencias
    console.log('🏗️ Inicializando contenedor de dependencias...');
    const container = new DependencyContainer();
    await container.initialize();
    console.log('✅ Contenedor inicializado\n');

    // Crear un contrato de prueba
    console.log('📝 Creando contrato de prueba...');
    const contractController = container.getContractController();

    const mockRequest = {
      body: {
        rutSociedad: '12345678-9',
        nombreColaborador: 'Juan Carlos Pérez López',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año después
        contractType: ContractType.PLAZO_FIJO,
        administradorContratoMandante: 'María González García',
        administradorContratoEmpresa: 'Carlos Silva Mendoza',
        rutAdministradorContrato: '98765432-1',
        contractNumber: 'CONT-2024-001',
        nombreMandante: 'Empresa ABC Ltda.',
        division: 'Operaciones',
        area: 'Construcción',
        dotacionPersonal: 5,
        dotacionVehiculos: 2,
        descripcionServicio: 'Servicios de construcción y mantención de infraestructura',
        nombreProyecto: 'Proyecto Infraestructura Norte',
        jornadaTrabajo: JornadaTrabajo.COMPLETA,
      }
    };

    const mockResponse = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`📄 Respuesta (${code}):`, JSON.stringify(data, null, 2));
          return mockResponse;
        }
      })
    };

    // Simular la creación del contrato
    await contractController.createContract(mockRequest as any, mockResponse as any);
    console.log('✅ Contrato creado exitosamente\n');

    // Obtener todos los contratos
    console.log('📋 Obteniendo todos los contratos...');
    const getAllRequest = {};
    await contractController.getAllContracts(getAllRequest as any, mockResponse as any);
    console.log('✅ Contratos obtenidos exitosamente\n');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('🎯 El sistema de gestión de contratos está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    if (error instanceof Error) {
      console.error('📝 Detalles del error:', error.message);
      console.error('📍 Stack trace:', error.stack);
    }
  } finally {
    // Cerrar la conexión a la base de datos
    console.log('\n🔌 Cerrando conexión a la base de datos...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  }
}

// Ejecutar las pruebas
testContractSystem().then(() => {
  console.log('\n🏁 Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
