import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket, TicketStatus } from './models/ticket.model';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Ticket)
@UseGuards(JwtAuthGuard)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @Query(() => [Ticket])
  async tickets(): Promise<Ticket[]> {
    return this.ticketService.findAll();
  }

  @Query(() => [Ticket])
  async ticketsByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<Ticket[]> {
    return this.ticketService.findByProject(projectId);
  }

  @Query(() => [Ticket])
  async ticketsBySprint(
    @Args('sprintId', { type: () => ID }) sprintId: string,
  ): Promise<Ticket[]> {
    return this.ticketService.findBySprint(sprintId);
  }

  @Query(() => [Ticket])
  async ticketsByAssignee(
    @Args('assigneeId', { type: () => ID }) assigneeId: string,
  ): Promise<Ticket[]> {
    return this.ticketService.findByAssignee(assigneeId);
  }

  @Query(() => Ticket)
  async ticket(@Args('id', { type: () => ID }) id: string): Promise<Ticket> {
    return this.ticketService.findOne(id);
  }

  @Mutation(() => Ticket)
  async createTicket(
    @Args('input') createTicketInput: CreateTicketInput,
    @CurrentUser() userId: string,
  ): Promise<Ticket> {
    return this.ticketService.create(createTicketInput, userId);
  }

  @Mutation(() => Ticket)
  async updateTicket(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateTicketInput: UpdateTicketInput,
  ): Promise<Ticket> {
    return this.ticketService.update(id, updateTicketInput);
  }

  @Mutation(() => Ticket)
  async updateTicketStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => TicketStatus }) status: TicketStatus,
    @CurrentUser() userId: string,
  ): Promise<Ticket> {
    return this.ticketService.updateStatus(id, status, userId);
  }

  @Mutation(() => Ticket)
  async assignTicket(
    @Args('id', { type: () => ID }) id: string,
    @Args('assigneeId', { type: () => ID }) assigneeId: string,
  ): Promise<Ticket> {
    return this.ticketService.assignToUser(id, assigneeId);
  }

  @Mutation(() => Boolean)
  async removeTicket(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.ticketService.remove(id);
  }
}
