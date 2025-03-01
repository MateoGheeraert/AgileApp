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
import Button from "@/app/components/reusable/Button";
import Modal from "@/app/components/reusable/Modal";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import AuthLayout from "@/app/components/AuthLayout";
import { Trash } from "lucide-react";
import SelectField from "@/app/components/reusable/SelectField";
import InputField from "@/app/components/reusable/InputField";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  assigneeName?: string;
}

interface Sprint {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const priorityOptions: { label: string; value: Ticket["priority"] }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

const statusOptions: { label: string; value: Ticket["status"] }[] = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function SprintDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [ticketData, setTicketData] = useState<Omit<Ticket, "_id">>({
    title: "",
    description: "",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    assigneeId: "",
    assigneeName: "",
  });

  useEffect(() => {
    if (user) {
      fetchSprint();
      fetchTickets();
    }
  }, []);

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
        console.log(sprint);
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
                assignee {
                  _id
                  name
                }
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

      // Map the tickets with assignee information
      const mappedTickets =
        result.data?.ticketsBySprint.map((ticket: any) => ({
          _id: ticket._id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assigneeId: ticket.assignee?._id || "",
          assigneeName: ticket.assignee?.name || "Unassigned",
        })) || [];

      setTickets(mappedTickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
    }
  }

  // async function fetchProjectUsers() {
  //   try {
  //     const response = await fetch("http://localhost:4000/graphql", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${Cookies.get("token")}`,
  //       },
  //       body: JSON.stringify({
  //         query: `
  //           query {
  //             users {
  //               _id
  //               name
  //               email
  //             }
  //           }
  //         `,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (result.errors) {
  //       console.error("GraphQL errors:", result.errors);
  //       return;
  //     }

  //     setUsers(result.data?.users || []);
  //   } catch (error) {
  //     console.error("Failed to fetch users:", error);
  //   }
  // }

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

    // Create a copy of ticketData to modify
    const ticketInput: any = { ...ticketData };

    // Remove assigneeName from the input as it's not expected by the API
    delete ticketInput.assigneeName;

    // If assigneeId is empty, remove it from the input to make it null in the database
    if (!ticketInput.assigneeId) {
      delete ticketInput.assigneeId;
    }

    const mutation = editingTicket
      ? `mutation UpdateTicket($id: ID!, $input: UpdateTicketInput!) {
          updateTicket(id: $id, input: $input) {
            _id
            title
            description
            status
            priority
            assignee {
              _id
              name
            }
          }
        }`
      : `mutation CreateTicket($input: CreateTicketInput!) {
          createTicket(input: $input) {
            _id
            title
            description
            status
            priority
            assignee {
              _id
              name
            }
          }
        }`;

    const variables = editingTicket
      ? {
          id: editingTicket._id,
          input: ticketInput,
        }
      : {
          input: {
            ...ticketInput,
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
        const updatedTicket = {
          ...result.data.updateTicket,
          assigneeId: result.data.updateTicket.assignee?._id || "",
          assigneeName: result.data.updateTicket.assignee?.name || "Unassigned",
        };

        setTickets(
          tickets.map((ticket) =>
            ticket._id === editingTicket._id ? updatedTicket : ticket
          )
        );
      } else if (result.data?.createTicket) {
        const newTicket = {
          ...result.data.createTicket,
          assigneeId: result.data.createTicket.assignee?._id || "",
          assigneeName: result.data.createTicket.assignee?.name || "Unassigned",
        };

        setTickets([...tickets, newTicket]);
      }

      setIsModalOpen(false);
      setEditingTicket(null);
      setTicketData({
        title: "",
        description: "",
        status: "TODO" as const,
        priority: "MEDIUM" as const,
        assigneeId: "",
        assigneeName: "",
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
    <AuthLayout>
      <div className='min-h-screen bg-gray-100'>
        {/* Navbar */}
        <div className='flex justify-between items-center mb-6'>
          <div className='mb-6'>
            <Link
              href={`/projects/${params.id}/sprints`}
              className='text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
            >
              ← Terug naar projecten
            </Link>
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setEditingTicket(null);
              setTicketData({
                title: "",
                description: "",
                status: "TODO" as const,
                priority: "MEDIUM" as const,
                assigneeId: "",
                assigneeName: "",
              });
            }}
          >
            Nieuwe taak
          </Button>
        </div>

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
                                        assigneeId: ticket.assigneeId || "",
                                        assigneeName:
                                          ticket.assigneeName || "Unassigned",
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
                                    <Trash className='w-4 h-4' />
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
                status: "TODO" as const,
                priority: "MEDIUM" as const,
                assigneeId: "",
                assigneeName: "",
              });
            }}
          >
            <form onSubmit={createOrUpdateTicket} className='space-y-4'>
              <div>
                <InputField
                  label='Title'
                  type='text'
                  value={ticketData.title}
                  onChange={(e) => setTicketData({ ...ticketData, title: e })}
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
                    setTicketData({
                      ...ticketData,
                      description: e.target.value,
                    })
                  }
                  className='mt-1 w-full p-2 border border-gray-300 rounded-lg text-black'
                  rows={3}
                />
              </div>

              <SelectField<Ticket["priority"]>
                label='Priority'
                value={ticketData.priority}
                onChange={(newValue) =>
                  setTicketData({ ...ticketData, priority: newValue })
                }
                options={priorityOptions}
              />

              <div className='mb-4'>
                <label
                  htmlFor='assignee'
                  className='block text-sm font-medium text-gray-700'
                >
                  Assignee (Optional)
                </label>
                <select
                  id='assignee'
                  name='assignee'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  value={ticketData.assigneeId || ""}
                  onChange={(e) =>
                    setTicketData({
                      ...ticketData,
                      assigneeId: e.target.value || "",
                    })
                  }
                >
                  <option value=''>Unassigned</option>
                </select>
              </div>

              {editingTicket && (
                <SelectField<Ticket["status"]>
                  label='Status'
                  value={ticketData.status}
                  onChange={(newValue) =>
                    setTicketData({ ...ticketData, status: newValue })
                  }
                  options={statusOptions}
                />
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
                      status: "TODO" as const,
                      priority: "MEDIUM" as const,
                      assigneeId: "",
                      assigneeName: "",
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
    </AuthLayout>
  );
}
