import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        extra: {
          max: configService.get<number>('database.maxConnections', 30),
          min: configService.get<number>('database.minConnections', 5),
          idleTimeoutMillis: configService.get<number>('database.idleTimeoutMs', 30000),
          connectionTimeoutMillis: configService.get<number>('database.connectionTimeoutMs', 5000),
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
