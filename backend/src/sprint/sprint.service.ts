import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sprint } from './models/sprint.model';
import { CreateSprintInput } from './dto/create-sprint.input';

@Injectable()
export class SprintService {
  constructor(@InjectModel(Sprint.name) private sprintModel: Model<Sprint>) {}

  async create(createSprintInput: CreateSprintInput): Promise<Sprint> {
    const sprint = new this.sprintModel(createSprintInput);
    return await sprint.save();
  }

  async findAll(): Promise<Sprint[]> {
    return this.sprintModel.find().exec();
  }

  async findByProject(projectId: string): Promise<Sprint[]> {
    return this.sprintModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.sprintModel.findById(id);
    if (!sprint) {
      throw new NotFoundException(`Sprint #${id} not found`);
    }
    return sprint;
  }

  async update(
    id: string,
    updateData: Partial<CreateSprintInput>,
  ): Promise<Sprint> {
    const sprint = await this.sprintModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!sprint) {
      throw new NotFoundException(`Sprint #${id} not found`);
    }
    return sprint;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.sprintModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
