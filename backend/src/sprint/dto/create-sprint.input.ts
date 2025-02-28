import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateSprintInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
