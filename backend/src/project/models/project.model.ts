import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class Project extends Document {
  @Field(() => ID)
  declare _id: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  description?: string;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
