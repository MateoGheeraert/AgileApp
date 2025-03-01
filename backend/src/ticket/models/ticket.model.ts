import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/auth/models/user.model';
import { Project } from 'src/project/models/project.model';
import { Sprint } from 'src/sprint/models/sprint.model';

export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(TicketStatus, {
  name: 'TicketStatus',
});

registerEnumType(TicketPriority, {
  name: 'TicketPriority',
});

@ObjectType()
@Schema()
export class Ticket extends Document {
  @Field(() => ID)
  declare _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field(() => TicketStatus)
  @Prop({ type: String, enum: TicketStatus, default: TicketStatus.TODO })
  status: TicketStatus;

  @Field(() => TicketPriority)
  @Prop({ type: String, enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sprint', required: true })
  sprintId: string;

  @Field(() => Sprint, { nullable: true }) // This enables querying sprint details
  sprint?: Sprint;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: string;

  @Field(() => Project, { nullable: true }) // This enables querying project details
  project?: Project;

  @Field(() => ID, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assigneeId?: string;

  @Field(() => User, { nullable: true }) // This enables querying assignee details
  assignee?: User;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creatorId: string;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
