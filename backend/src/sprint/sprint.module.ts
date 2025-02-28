import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SprintService } from './sprint.service';
import { SprintResolver } from './sprint.resolver';
import { Sprint, SprintSchema } from './models/sprint.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sprint.name, schema: SprintSchema }]),
  ],
  providers: [SprintService, SprintResolver],
  exports: [SprintService],
})
export class SprintModule {}
