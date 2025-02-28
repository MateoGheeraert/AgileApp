import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';
import { Ticket, TicketSchema } from './models/ticket.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [TicketService, TicketResolver],
  exports: [TicketService],
})
export class TicketModule {}
