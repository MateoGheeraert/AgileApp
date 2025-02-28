"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

interface Ticket {
  _id: string;
  title: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
  });
  const [error, setError] = useState("");

  const fetchProjectAndTickets = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            query GetProjectAndTickets($id: ID!) {
              project(id: $id) {
                _id
                name
                description
                createdAt
              }
              ticketsByProject(projectId: $id) {
                _id
                title
                description
                status
                priority
                createdAt
              }
            }
          `,
          variables: {
            id: params.id,
          },
        }),
      });

      const { data } = await response.json();
      if (data?.project) {
        setProject(data.project);
        setTickets(data.ticketsByProject || []);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setError("Failed to fetch project details");
    }
  }, [params.id]);

  useEffect(() => {
    fetchProjectAndTickets();
  }, [fetchProjectAndTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
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
            mutation CreateTicket($input: CreateTicketInput!) {
              createTicket(input: $input) {
                _id
                title
                description
                status
                priority
                createdAt
              }
            }
          `,
          variables: {
            input: {
              projectId: params.id,
              ...newTicket,
            },
          },
        }),
      });

      const { data } = await response.json();
      if (data?.createTicket) {
        setTickets([...tickets, data.createTicket]);
        setIsCreating(false);
        setNewTicket({
          title: "",
          description: "",
          priority: "MEDIUM",
        });
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setError("Failed to create ticket");
    }
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: "OPEN" | "IN_PROGRESS" | "DONE"
  ) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTicketStatus($ticketId: String!, $status: TicketStatus!) {
              updateTicketStatus(ticketId: $ticketId, status: $status) {
                _id
                status
              }
            }
          `,
          variables: {
            ticketId,
            status: newStatus,
          },
        }),
      });

      const { data } = await response.json();
      if (data?.updateTicketStatus) {
        setTickets(
          tickets.map((ticket) =>
            ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      setError("Failed to update ticket status");
    }
  };

  if (!project) {
    return <div className='p-4'>Loading...</div>;
  }

  const ticketsByStatus = {
    OPEN: tickets.filter((t) => t.status === "OPEN"),
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tickets.filter((t) => t.status === "DONE"),
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <Link
                href='/dashboard'
                className='text-gray-500 hover:text-gray-700'
              >
                ← Back to Projects
              </Link>
            </div>
            <div className='flex items-center'>
              <button
                onClick={() => setIsCreating(true)}
                className='bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700'
              >
                New Ticket
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>{project.name}</h1>
          {project.description && (
            <p className='mt-2 text-gray-600'>{project.description}</p>
          )}
        </div>

        {error && <div className='mb-4 text-red-500 text-center'>{error}</div>}

        {isCreating && (
          <div className='mb-8 bg-white shadow sm:rounded-lg p-6'>
            <h2 className='text-lg font-medium mb-4'>Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='title'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Title
                  </label>
                  <input
                    type='text'
                    id='title'
                    required
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Description
                  </label>
                  <textarea
                    id='description'
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor='priority'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Priority
                  </label>
                  <select
                    id='priority'
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                      })
                    }
                  >
                    <option value='LOW'>Low</option>
                    <option value='MEDIUM'>Medium</option>
                    <option value='HIGH'>High</option>
                  </select>
                </div>
                <div className='flex justify-end space-x-3'>
                  <button
                    type='button'
                    onClick={() => setIsCreating(false)}
                    className='bg-white text-gray-700 px-4 py-2 border rounded-md hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
                  >
                    Create Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {(["OPEN", "IN_PROGRESS", "DONE"] as const).map((status) => (
            <div key={status} className='bg-white shadow rounded-lg p-4'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                {status.replace("_", " ")}
              </h3>
              <div className='space-y-4'>
                {ticketsByStatus[status].map((ticket) => (
                  <div
                    key={ticket._id}
                    className='border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow'
                  >
                    <div className='flex justify-between items-start'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        {ticket.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          ticket.priority === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : ticket.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    {ticket.description && (
                      <p className='mt-1 text-sm text-gray-600'>
                        {ticket.description}
                      </p>
                    )}
                    <div className='mt-4'>
                      <select
                        className='text-sm border border-gray-300 rounded p-1'
                        value={ticket.status}
                        onChange={(e) =>
                          handleUpdateTicketStatus(
                            ticket._id,
                            e.target.value as "OPEN" | "IN_PROGRESS" | "DONE"
                          )
                        }
                      >
                        <option value='OPEN'>Open</option>
                        <option value='IN_PROGRESS'>In Progress</option>
                        <option value='DONE'>Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
