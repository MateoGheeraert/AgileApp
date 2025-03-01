"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "../components/Button";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: `
            query {
              projects {
                _id
                name
                description
                createdAt
              }
            }
          `,
        }),
      });

      const { data } = await response.json();
      if (data?.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to fetch projects");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateProject($name: String!, $description: String) {
              createProject(name: $name, description: $description) {
                _id
                name
                description
                createdAt
              }
            }
          `,
          variables: {
            name: newProjectName,
            description: newProjectDescription || null,
          },
        }),
      });

      const { data } = await response.json();
      if (data?.createProject) {
        setProjects([...projects, data.createProject]);
        setIsCreating(false);
        setNewProjectName("");
        setNewProjectDescription("");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Failed to create project");
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navbar */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16 items-center'>
            <h1 className='text-xl text-black font-semibold'>Projects</h1>
            <div className='flex items-center'>
              <span className='text-black mr-4'>Welcome, {user?.name}</span>
              <Button onClick={() => setIsCreating(true)}>New Project</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {error && <div className='mb-4 text-red-500 text-center'>{error}</div>}

        {/* Create Project Form */}
        {isCreating && (
          <div className='mb-8 bg-white shadow sm:rounded-lg p-6'>
            <h2 className='text-lg font-medium mb-4'>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Project Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    required
                    className='mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2'
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id='description'
                    className='mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2'
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
                <div className='flex justify-end space-x-3'>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Create Project</Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className='block'
            >
              <div className='bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg font-medium text-gray-900 truncate'>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className='mt-1 text-sm text-gray-600 line-clamp-2'>
                      {project.description}
                    </p>
                  )}
                  <p className='mt-2 text-xs text-gray-500'>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
