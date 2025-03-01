import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../models/ticket.model';

@InputType()
export class UpdateTicketInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TicketStatus, { nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @Field(() => TicketPriority, { nullable: true })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field({ nullable: true })
  @IsMongoId()
  @IsOptional()
  sprintId?: string;

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
