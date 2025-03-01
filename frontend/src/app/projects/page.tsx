"use client";

import { useState, useEffect, SetStateAction } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import Button from "../components/reusable/Button";
import AuthLayout from "../components/AuthLayout";
import Modal from "../components/reusable/Modal";
import InputField from "../components/reusable/InputField";
interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
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
        setisModalOpen(false);
        setNewProjectName("");
        setNewProjectDescription("");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Failed to create project");
    }
  };

  return (
    <AuthLayout>
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Projecten</h1>
          <Button onClick={() => setisModalOpen(true)}>Nieuw project</Button>
        </div>

        {error && <div className='mb-4 text-red-500 text-center'>{error}</div>}

        {/* Create Project Form */}
        {isModalOpen && (
          <Modal title='Nieuw project' onClose={() => setisModalOpen(false)}>
            {" "}
            <form onSubmit={handleCreateProject}>
              <div className='space-y-4'>
                <InputField
                  label='Project naam'
                  placeholder='Voer project naam in'
                  value={newProjectName}
                  onChange={(newValue: SetStateAction<string>) =>
                    setNewProjectName(newValue)
                  }
                />
                <div>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Beschrijving (optioneel)
                  </label>
                  <textarea
                    id='description'
                    className='mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 text-black'
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
                <div className='flex justify-end space-x-3'>
                  <Button
                    variant='outline'
                    onClick={() => setisModalOpen(false)}
                    type='button'
                  >
                    Annuleer
                  </Button>
                  <Button type='submit'>Maak project</Button>
                </div>
              </div>
            </form>
          </Modal>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {projects.length === 0 ? (
              <div className='col-span-full text-center py-12 bg-white rounded-lg shadow-md'>
                <p className='text-gray-500'>
                  Geen projecten gevonden. Maak je eerste project!
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className='block'
                >
                  <div className='bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow'>
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
                        Aangemaakt op{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
