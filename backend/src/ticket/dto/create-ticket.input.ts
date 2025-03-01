import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../models/ticket.model';

@InputType()
export class CreateTicketInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => TicketStatus, { defaultValue: TicketStatus.TODO })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @Field(() => TicketPriority, { defaultValue: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field()
  @IsMongoId()
  sprintId: string;

  @Field()
  @IsMongoId()
  projectId: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  spentHours?: number;

  @Field({ nullable: true })
  @IsMongoId()
  @IsOptional()
  assigneeId?: string;
}
