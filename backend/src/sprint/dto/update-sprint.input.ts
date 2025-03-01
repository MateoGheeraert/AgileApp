import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateSprintInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
