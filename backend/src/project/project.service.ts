import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './models/project.model';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec(); // Fetch from MongoDB
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async create(data: { name: string; description?: string }): Promise<Project> {
    const newProject = new this.projectModel(data);
    return await newProject.save(); // Save to MongoDB
  }

  async count(): Promise<number> {
    return this.projectModel.countDocuments().exec();
  }
}
