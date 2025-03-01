import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SprintService } from './sprint.service';
import { SprintResolver } from './sprint.resolver';
import { Sprint, SprintSchema } from './models/sprint.model';
import { ProjectModule } from 'src/project/project.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sprint.name, schema: SprintSchema }]),
    ProjectModule,
  ],
  providers: [SprintService, SprintResolver],
  exports: [SprintService],
})
export class SprintModule {}
