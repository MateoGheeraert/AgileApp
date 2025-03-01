import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketStatus } from './models/ticket.model';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';

@Injectable()
export class TicketService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async create(
    createTicketInput: CreateTicketInput,
    userId: string,
  ): Promise<Ticket> {
    const ticket = new this.ticketModel({
      ...createTicketInput,
      creatorId: userId,
    });
    return await ticket.save();
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findByProject(projectId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ projectId }).exec();
  }

  async findBySprint(sprintId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ sprintId }).exec();
  }

  async findByAssignee(assigneeId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ assigneeId }).exec();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    return ticket;
  }

  async update(
    id: string,
    updateTicketInput: UpdateTicketInput,
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateTicketInput,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }

    return ticket;
  }

  async updateStatus(
    id: string,
    status: TicketStatus,
    userId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (!ticket.assigneeId || ticket.assigneeId.toString() !== userId) {
      throw new ForbiddenException(
        'Only the assigned user can update the ticket status',
      );
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    return await ticket.save();
  }

  async assignToUser(id: string, assigneeId: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.assigneeId = assigneeId;
    ticket.updatedAt = new Date();
    return await ticket.save();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.ticketModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
