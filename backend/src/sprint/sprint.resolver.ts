import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { SprintService } from './sprint.service';
import { Sprint } from './models/sprint.model';
import { CreateSprintInput } from './dto/create-sprint.input';
import { UpdateSprintInput } from './dto/update-sprint.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Project } from 'src/project/models/project.model';
import { ProjectService } from 'src/project/project.service';
@Resolver(() => Sprint)
@UseGuards(JwtAuthGuard)
export class SprintResolver {
  constructor(
    private readonly sprintService: SprintService,
    private readonly projectService: ProjectService, // Inject ProjectService
  ) {}

  @Query(() => [Sprint])
  async sprints(): Promise<Sprint[]> {
    return this.sprintService.findAll();
  }

  @Query(() => [Sprint])
  async sprintsByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<Sprint[]> {
    return this.sprintService.findByProject(projectId);
  }

  @Query(() => Sprint)
  async sprint(@Args('id', { type: () => ID }) id: string): Promise<Sprint> {
    return this.sprintService.findOne(id);
  }

  @Query(() => Number)
  async activeSprintCount(): Promise<number> {
    return await this.sprintService.countActiveSprints();
  }

  @Query(() => [Sprint])
  async activeSprints(): Promise<Sprint[]> {
    return this.sprintService.findActiveSprints();
  }

  @ResolveField(() => Project)
  async project(@Parent() sprint: Sprint): Promise<Project> {
    return await this.projectService.findOne(sprint.projectId); // Fetch the project
  }

  @Mutation(() => Sprint)
  async createSprint(
    @Args('input') createSprintInput: CreateSprintInput,
  ): Promise<Sprint> {
    return this.sprintService.create(createSprintInput);
  }

  @Mutation(() => Sprint)
  async updateSprint(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateSprintInput: UpdateSprintInput,
  ): Promise<Sprint> {
    return this.sprintService.update(id, updateSprintInput);
  }

  @Mutation(() => Boolean)
  async removeSprint(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.sprintService.remove(id);
  }
}
