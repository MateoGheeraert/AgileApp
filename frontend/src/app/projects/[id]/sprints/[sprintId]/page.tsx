/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface Sprint {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function SprintDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [ticketData, setTicketData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (user) {
      fetchSprint();
      fetchTickets();
    }
  }, [user]);

  async function fetchSprint() {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            query GetSprint($id: ID!) {
              sprint(id: $id) {
                _id
                name
                startDate
                endDate
              }
            }
          `,
          variables: { id: params.sprintId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      if (result.data?.sprint) {
        setSprint(result.data.sprint);
      }
    } catch (error) {
      console.error("Failed to fetch sprint:", error);
    }
  }

  async function fetchTickets() {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            query GetTickets($sprintId: ID!) {
              ticketsBySprint(sprintId: $sprintId) {
                _id
                title
                description
                status
                priority
              }
            }
          `,
          variables: { sprintId: params.sprintId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      setTickets(result.data?.ticketsBySprint || []);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
    }
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Ticket["status"];

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTicket($id: ID!, $input: UpdateTicketInput!) {
              updateTicket(id: $id, input: $input) {
                _id
                status
              }
            }
          `,
          variables: {
            id: draggableId,
            input: { status: newStatus },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      setTickets((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  async function createOrUpdateTicket(e: React.FormEvent) {
    e.preventDefault();

    if (!user?._id) {
      console.error("No user ID available");
      return;
    }

    const mutation = editingTicket
      ? `mutation UpdateTicket($id: ID!, $input: UpdateTicketInput!) {
          updateTicket(id: $id, input: $input) {
            _id
            title
            description
            status
            priority
          }
        }`
      : `mutation CreateTicket($input: CreateTicketInput!) {
          createTicket(input: $input) {
            _id
            title
            description
            status
            priority
          }
        }`;

    const variables = editingTicket
      ? {
          id: editingTicket._id,
          input: ticketData,
        }
      : {
          input: {
            ...ticketData,
            sprintId: params.sprintId,
            projectId: params.id,
          },
        };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        return;
      }

      if (editingTicket && result.data?.updateTicket) {
        setTickets(
          tickets.map((ticket) =>
            ticket._id === editingTicket._id ? result.data.updateTicket : ticket
          )
        );
      } else if (result.data?.createTicket) {
        setTickets([...tickets, result.data.createTicket]);
      }

      setIsModalOpen(false);
      setEditingTicket(null);
      setTicketData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
      });
    } catch (error) {
      console.error("Error creating/updating ticket:", error);
    }
  }

  async function handleDeleteTicket(ticketId: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation RemoveTicket($id: ID!) {
              removeTicket(id: $id)
            }
          `,
          variables: { id: ticketId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      if (result.data?.removeTicket) {
        setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }

  const ticketStatusColumns = [
    { id: "TODO", label: "To Do" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "IN_REVIEW", label: "In Review" },
    { id: "RESOLVED", label: "Resolved" },
  ];

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navbar */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16 items-center'>
            <Link
              href={`/projects/${params.id}/sprints`}
              className='text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
            >
              ← Back to Sprints
            </Link>
            <h1 className='text-xl font-semibold'>
              {sprint ? sprint.name : "Sprint Details"}
            </h1>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setEditingTicket(null);
                setTicketData({
                  title: "",
                  description: "",
                  status: "TODO",
                  priority: "MEDIUM",
                });
              }}
            >
              New Ticket
            </Button>
          </div>
        </div>
      </nav>

      {/* Kanban Board */}
      <main className='max-w-7xl mx-auto py-10 sm:px-6 lg:px-8'>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-6'>
            {ticketStatusColumns.map(({ id, label }) => (
              <Droppable key={id} droppableId={id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className='bg-white p-4 rounded-lg shadow-lg'
                  >
                    <h2 className='text-lg font-bold text-black mb-3'>
                      {label}
                    </h2>
                    {tickets
                      .filter((ticket) => ticket.status === id)
                      .map((ticket, index) => (
                        <Draggable
                          key={ticket._id}
                          draggableId={ticket._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className='p-4 mb-3 bg-gray-50 rounded-lg shadow hover:shadow-md transition cursor-pointer'
                            >
                              <div className='flex justify-between items-start'>
                                <div
                                  onClick={() => {
                                    setEditingTicket(ticket);
                                    setTicketData({
                                      title: ticket.title,
                                      description: ticket.description,
                                      status: ticket.status,
                                      priority: ticket.priority,
                                    });
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <h3 className='font-semibold text-primaryBlue-500'>
                                    {ticket.title}
                                  </h3>
                                  <p className='text-sm text-gray-600 line-clamp-2'>
                                    {ticket.description}
                                  </p>
                                </div>
                                <Button
                                  variant='danger'
                                  className='px-2 py-1 text-xs'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTicket(ticket._id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                              <div className='mt-2 flex justify-between items-center'>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    ticket.priority === "HIGH" ||
                                    ticket.priority === "URGENT"
                                      ? "bg-red-100 text-red-800"
                                      : ticket.priority === "MEDIUM"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {ticket.priority}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Modal for Creating/Editing Tickets */}
      {isModalOpen && (
        <Modal
          title={editingTicket ? "Edit Ticket" : "New Ticket"}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTicket(null);
            setTicketData({
              title: "",
              description: "",
              status: "TODO",
              priority: "MEDIUM",
            });
          }}
        >
          <form onSubmit={createOrUpdateTicket} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Title
              </label>
              <input
                type='text'
                required
                value={ticketData.title}
                onChange={(e) =>
                  setTicketData({ ...ticketData, title: e.target.value })
                }
                className='mt-1 w-full p-2 border border-gray-300 rounded-lg'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                required
                value={ticketData.description}
                onChange={(e) =>
                  setTicketData({ ...ticketData, description: e.target.value })
                }
                className='mt-1 w-full p-2 border border-gray-300 rounded-lg'
                rows={3}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Priority
              </label>
              <select
                value={ticketData.priority}
                onChange={(e) =>
                  setTicketData({
                    ...ticketData,
                    priority: e.target.value as any,
                  })
                }
                className='mt-1 w-full p-2 border border-gray-300 rounded-lg'
              >
                <option value='LOW'>Low</option>
                <option value='MEDIUM'>Medium</option>
                <option value='HIGH'>High</option>
                <option value='URGENT'>Urgent</option>
              </select>
            </div>

            {editingTicket && (
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Status
                </label>
                <select
                  value={ticketData.status}
                  onChange={(e) =>
                    setTicketData({
                      ...ticketData,
                      status: e.target.value as any,
                    })
                  }
                  className='mt-1 w-full p-2 border border-gray-300 rounded-lg'
                >
                  <option value='TODO'>To Do</option>
                  <option value='IN_PROGRESS'>In Progress</option>
                  <option value='IN_REVIEW'>In Review</option>
                  <option value='RESOLVED'>Resolved</option>
                </select>
              </div>
            )}

            <div className='flex justify-end space-x-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTicket(null);
                  setTicketData({
                    title: "",
                    description: "",
                    status: "TODO",
                    priority: "MEDIUM",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>
                {editingTicket ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
