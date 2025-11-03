import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { errorHandler } from '@shared/middleware/error-handler';
import { initializeDatabase } from '@shared/infrastructure/database/typeorm.config';
import { createUserRoutes } from '@presentation/routes/user.routes';
import { createContractRoutes } from '@presentation/routes/contract.routes';
import { createColaboratorRoutes } from '@presentation/routes/colaborators.routes';
import { DependencyContainer } from './dependency-container';

export class App {
  private app: Application;
  private dependencyContainer: DependencyContainer;

  constructor() {
    this.app = express();
    this.dependencyContainer = new DependencyContainer();
  }

  public async initialize(): Promise<void> {
    // Initialize database
    await initializeDatabase();
    
    // Initialize dependencies
    await this.dependencyContainer.initialize();
    
    // Setup middleware
    this.setupMiddleware();
    
    // Setup routes
    this.setupRoutes();
    
    // Setup error handling
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        error: {
          message: 'Too many requests from this IP, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString(),
        },
      },
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Health check middleware
    this.app.use('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });
  }

  private setupRoutes(): void {
    // API info endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Gestion Documental API',
        version: '1.0.0',
        endpoints: {
          users: '/api/users',
          contracts: '/api/contracts',
          colaborators: '/api/colaborators',
          health: '/health',
        },
      });
    });

    // Get controllers from dependency container
    const userController = this.dependencyContainer.getUserController();
    const contractController = this.dependencyContainer.getContractController();
    const colaboratorController = this.dependencyContainer.getColaboratorController();

    // API routes
    this.app.use('/api/users', createUserRoutes(userController));
    this.app.use('/api/contracts', createContractRoutes(contractController));
    this.app.use('/api/colaborators', createColaboratorRoutes(colaboratorController));

    // 404 handler for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: {
          message: `Route ${req.originalUrl} not found`,
          code: 'ROUTE_NOT_FOUND',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 API documentation available at http://localhost:${port}/api`);
      console.log(`❤️  Health check available at http://localhost:${port}/health`);
    });
  }
}