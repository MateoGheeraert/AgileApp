"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Button from "@/app/components/Button";
import { format } from "date-fns";
import AuthLayout from "@/app/components/AuthLayout";
import Modal from "@/app/components/Modal";
import InputField from "@/app/components/InputField";
import { Pencil, Trash } from "lucide-react";

interface Sprint {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function SprintsPage() {
  const params = useParams();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [newSprint, setNewSprint] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchSprints();
  }, []);

  async function fetchSprints() {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            query GetSprints($projectId: ID!) {
              sprintsByProject(projectId: $projectId) {
                _id
                name
                startDate
                endDate
              }
            }
          `,
          variables: { projectId: params.id },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      setSprints(result.data?.sprintsByProject || []);
    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      setSprints([]);
    }
  }

  async function handleCreateSprint(e: React.FormEvent) {
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
            mutation CreateSprint($input: CreateSprintInput!) {
              createSprint(input: $input) {
                _id
                name
                startDate
                endDate
              }
            }
          `,
          variables: { input: { ...newSprint, projectId: params.id } },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      if (result.data?.createSprint) {
        setSprints([...sprints, result.data.createSprint]);
        setisModalOpen(false);
        setNewSprint({ name: "", startDate: "", endDate: "" });
      }
    } catch (error) {
      console.error("Failed to create sprint:", error);
    }
  }

  async function handleUpdateSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSprint) return;

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateSprint($id: ID!, $input: UpdateSprintInput!) {
              updateSprint(id: $id, input: $input) {
                _id
                name
                startDate
                endDate
              }
            }
          `,
          variables: {
            id: editingSprint._id,
            input: {
              name: newSprint.name,
              startDate: newSprint.startDate,
              endDate: newSprint.endDate,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      if (result.data?.updateSprint) {
        setSprints(
          sprints.map((s) =>
            s._id === editingSprint._id ? result.data.updateSprint : s
          )
        );
        setIsEditing(false);
        setEditingSprint(null);
        setNewSprint({ name: "", startDate: "", endDate: "" });
      }
    } catch (error) {
      console.error("Failed to update sprint:", error);
    }
  }

  function handleEditSprint(sprint: Sprint) {
    setEditingSprint(sprint);
    setNewSprint({
      name: sprint.name,
      startDate: sprint.startDate.split("T")[0], // Format date for input
      endDate: sprint.endDate.split("T")[0], // Format date for input
    });
    setIsEditing(true);
  }

  async function handleDeleteSprint(sprintId: string) {
    if (!confirm("Are you sure you want to delete this sprint?")) return;

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation RemoveSprint($id: ID!) {
              removeSprint(id: $id)
            }
          `,
          variables: { id: sprintId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      if (result.data?.removeSprint) {
        setSprints(sprints.filter((s) => s._id !== sprintId));
      }
    } catch (error) {
      console.error("Failed to delete sprint:", error);
    }
  }

  return (
    <AuthLayout>
      <div>
        <div className='flex justify-between items-center mb-6'>
          <div className='mb-6'>
            <Link
              href={`/projects/${params.id}`}
              className='text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
            >
              ← Back to Projects
            </Link>
          </div>
          {/* Create Sprint Button */}
          <div className='mt-6 flex justify-center'>
            <Button
              onClick={() => {
                setisModalOpen(true);
                setIsEditing(false);
                setEditingSprint(null);
                setNewSprint({ name: "", startDate: "", endDate: "" });
              }}
              className='w-full max-w-xs'
            >
              New Sprint
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className='w-full mx-auto py-10 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg p-6'>
          <h1 className='text-3xl font-bold text-black'>Sprints</h1>

          {/* Sprint Creation Form */}
          {isModalOpen && (
            <Modal
              title='Create New Sprint'
              onClose={() => setisModalOpen(false)}
            >
              <form onSubmit={handleCreateSprint} className='space-y-4 mt-4'>
                <InputField
                  label='Sprint Name'
                  placeholder='Enter sprint name'
                  value={newSprint.name}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, name: newValue })
                  }
                />

                <InputField
                  label='Start Date'
                  type='date'
                  value={newSprint.startDate}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, startDate: newValue })
                  }
                />

                <InputField
                  label='End Date'
                  type='date'
                  value={newSprint.endDate}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, endDate: newValue })
                  }
                />
                <div className='flex justify-end space-x-3'>
                  <Button
                    variant='outline'
                    onClick={() => setisModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Create Sprint</Button>
                </div>
              </form>
            </Modal>
          )}

          {/* Sprint Edit Form */}
          {isEditing && editingSprint && (
            <Modal title='Edit Sprint' onClose={() => setIsEditing(false)}>
              <form onSubmit={handleUpdateSprint} className='space-y-4 mt-4'>
                <InputField
                  label='Sprint Name'
                  placeholder='Enter sprint name'
                  value={newSprint.name}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, name: newValue })
                  }
                />

                <InputField
                  label='Start Date'
                  type='date'
                  value={newSprint.startDate}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, startDate: newValue })
                  }
                />

                <InputField
                  label='End Date'
                  type='date'
                  value={newSprint.endDate}
                  onChange={(newValue) =>
                    setNewSprint({ ...newSprint, endDate: newValue })
                  }
                />
                <div className='flex justify-end space-x-3'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setEditingSprint(null);
                      setNewSprint({ name: "", startDate: "", endDate: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Update Sprint</Button>
                </div>
              </form>
            </Modal>
          )}

          {/* Sprint List */}
          <ul className='mt-6 space-y-3'>
            {sprints.length === 0 ? (
              <p className='text-gray-500 text-center'>No sprints available.</p>
            ) : (
              sprints.map((sprint) => (
                <li
                  key={sprint._id}
                  className='bg-white p-4 rounded-lg shadow hover:shadow-md transition'
                >
                  <div className='flex justify-between items-center'>
                    <Link
                      href={`/projects/${params.id}/sprints/${sprint._id}`}
                      className='block'
                    >
                      <h2 className='text-lg font-semibold text-primaryBlue-500 hover:text-primaryBlue-600'>
                        {sprint.name}
                      </h2>
                      <p className='text-sm text-gray-600'>
                        {format(new Date(sprint.startDate), "dd/MM/yyyy")} -{" "}
                        {format(new Date(sprint.endDate), "dd/MM/yyyy")}
                      </p>
                    </Link>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditSprint(sprint);
                        }}
                      >
                        <Pencil className='w-4 h-4' />
                      </Button>

                      <Button
                        variant='danger'
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteSprint(sprint._id);
                        }}
                      >
                        <Trash className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </main>
      </div>
    </AuthLayout>
  );
}
