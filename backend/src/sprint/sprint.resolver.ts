import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SprintService } from './sprint.service';
import { Sprint } from './models/sprint.model';
import { CreateSprintInput } from './dto/create-sprint.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Sprint)
@UseGuards(JwtAuthGuard)
export class SprintResolver {
  constructor(private readonly sprintService: SprintService) {}

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

  @Mutation(() => Sprint)
  async createSprint(
    @Args('input') createSprintInput: CreateSprintInput,
  ): Promise<Sprint> {
    return this.sprintService.create(createSprintInput);
  }

  @Mutation(() => Sprint)
  async updateSprint(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateSprintInput: CreateSprintInput,
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
