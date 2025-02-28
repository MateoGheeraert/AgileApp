import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class User extends Document {
  @Field(() => ID)
  declare _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
