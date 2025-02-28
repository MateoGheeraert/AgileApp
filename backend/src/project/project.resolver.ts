import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Project } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    return await this.projectService.findAll();
  }

  @Query(() => Project)
  async project(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  @Mutation(() => Project)
  createProject(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<Project> {
    return this.projectService.create({ name, description });
  }
}
