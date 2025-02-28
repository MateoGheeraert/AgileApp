import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';

@ObjectType()
@Schema()
export class Sprint extends Document {
  @Field(() => ID)
  declare _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  startDate: Date;

  @Field()
  @Prop({ required: true })
  endDate: Date;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SprintSchema = SchemaFactory.createForClass(Sprint);
