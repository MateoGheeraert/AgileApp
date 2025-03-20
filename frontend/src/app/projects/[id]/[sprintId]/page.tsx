/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Trash, Clock, ClipboardCheck } from "lucide-react";
import SelectField from "@/app/components/reusable/SelectField";
import InputField from "@/app/components/reusable/InputField";
import Dropdown from "@/app/components/reusable/Dropdown";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  spentHours?: number;
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
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [loggingHoursTicket, setLoggingHoursTicket] = useState<Ticket | null>(
    null
  );
  const [hoursToLog, setHoursToLog] = useState<number>(0);
  const [ticketData, setTicketData] = useState<Omit<Ticket, "_id">>({
    title: "",
    description: "",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    assigneeId: "",
    assigneeName: "",
    estimatedHours: 0,
    spentHours: 0,
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
                estimatedHours
                spentHours
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
          estimatedHours: ticket.estimatedHours || 0,
          spentHours: ticket.spentHours || 0,
          assigneeId: ticket.assignee?._id || "",
          assigneeName: ticket.assignee?.name || "Unassigned",
        })) || [];

      setTickets(mappedTickets);
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

  async function logHours(e: React.FormEvent) {
    e.preventDefault();
    if (!loggingHoursTicket) return;

    try {
      const currentSpentHours = loggingHoursTicket.spentHours || 0;
      const newSpentHours = currentSpentHours + hoursToLog;

      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTicket($id: ID!, $input: UpdateTicketInput!) {
              updateTicket(id: $id, input: $input) {
                _id
                spentHours
              }
            }
          `,
          variables: {
            id: loggingHoursTicket._id,
            input: { spentHours: newSpentHours },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return;
      }

      // Update the ticket in the local state
      setTickets(
        tickets.map((t) =>
          t._id === loggingHoursTicket._id
            ? { ...t, spentHours: newSpentHours }
            : t
        )
      );

      // Close the modal and reset
      setIsHoursModalOpen(false);
      setLoggingHoursTicket(null);
      setHoursToLog(0);
    } catch (error) {
      console.error("Error logging hours:", error);
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
              href={`/projects/${params.id}`}
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
                estimatedHours: 0,
                spentHours: 0,
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
                                        estimatedHours:
                                          ticket.estimatedHours || 0,
                                        spentHours: ticket.spentHours || 0,
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
                                  <Dropdown>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLoggingHoursTicket(ticket);
                                        setIsHoursModalOpen(true);
                                      }}
                                      className='w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                    >
                                      <Clock className='w-4 h-4 mr-2' /> Log
                                      Hours
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTicket(ticket._id);
                                      }}
                                      className='w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                                    >
                                      <Trash className='w-4 h-4 mr-2' /> Delete
                                      Ticket
                                    </button>
                                  </Dropdown>
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

                                {/* Hours information with progress bar */}
                                <div className='mt-2 text-xs text-gray-600'>
                                  <div className='flex justify-between mb-1'>
                                    <div
                                      className='flex items-center'
                                      title='Estimated hours'
                                    >
                                      <ClipboardCheck className='w-3 h-3 mr-1' />
                                      <span>
                                        Est: {ticket.estimatedHours || 0}h
                                      </span>
                                    </div>
                                    <div
                                      className='flex items-center'
                                      title='Spent hours'
                                    >
                                      <Clock className='w-3 h-3 mr-1' />
                                      <span>
                                        Spent: {ticket.spentHours || 0}h
                                      </span>
                                    </div>
                                  </div>

                                  {/* Progress bar */}
                                  {(ticket.estimatedHours || 0) > 0 && (
                                    <div className='h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                                      <div
                                        className={`h-full ${
                                          (ticket.spentHours || 0) >
                                          (ticket.estimatedHours || 0)
                                            ? "bg-red-500"
                                            : (ticket.spentHours || 0) >=
                                              (ticket.estimatedHours || 0) * 0.8
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                        style={{
                                          width: `${Math.min(
                                            ((ticket.spentHours || 0) /
                                              (ticket.estimatedHours || 1)) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  )}
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
                estimatedHours: 0,
                spentHours: 0,
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

              <InputField
                label='Estimated Hours'
                type='number'
                value={ticketData.estimatedHours?.toString() || "0"}
                onChange={(e) =>
                  setTicketData({
                    ...ticketData,
                    estimatedHours: parseInt(e) || 0,
                  })
                }
              />

              {editingTicket && (
                <>
                  <SelectField<Ticket["status"]>
                    label='Status'
                    value={ticketData.status}
                    onChange={(newValue) =>
                      setTicketData({ ...ticketData, status: newValue })
                    }
                    options={statusOptions}
                  />
                </>
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
                      estimatedHours: 0,
                      spentHours: 0,
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

        {/* Modal for Logging Hours */}
        {isHoursModalOpen && loggingHoursTicket && (
          <Modal
            title={`Log Hours - ${loggingHoursTicket.title}`}
            onClose={() => {
              setIsHoursModalOpen(false);
              setLoggingHoursTicket(null);
              setHoursToLog(0);
            }}
          >
            <div className='mb-6 bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium text-gray-800 mb-3'>
                Time Tracking Summary
              </h3>

              <div className='flex justify-between text-sm mb-2'>
                <span className='text-gray-600'>Estimated:</span>
                <span className='font-medium'>
                  {loggingHoursTicket.estimatedHours || 0} hours
                </span>
              </div>

              <div className='flex justify-between text-sm mb-3'>
                <span className='text-gray-600'>Spent so far:</span>
                <span className='font-medium'>
                  {loggingHoursTicket.spentHours || 0} hours
                </span>
              </div>

              <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className={`h-full ${
                    (loggingHoursTicket.spentHours || 0) >
                    (loggingHoursTicket.estimatedHours || 0)
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      ((loggingHoursTicket.spentHours || 0) /
                        (loggingHoursTicket.estimatedHours || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              {(loggingHoursTicket.spentHours || 0) >
                (loggingHoursTicket.estimatedHours || 0) && (
                <p className='text-xs text-red-600 mt-2'>
                  ⚠️ Time spent exceeds the estimated time by{" "}
                  {(
                    (loggingHoursTicket.spentHours || 0) -
                    (loggingHoursTicket.estimatedHours || 0)
                  ).toFixed(2)}{" "}
                  hours
                </p>
              )}

              {(loggingHoursTicket.estimatedHours || 0) > 0 && (
                <p className='text-xs text-gray-600 mt-2'>
                  Remaining:{" "}
                  {Math.max(
                    0,
                    (loggingHoursTicket.estimatedHours || 0) -
                      (loggingHoursTicket.spentHours || 0)
                  ).toFixed(2)}{" "}
                  hours
                </p>
              )}
            </div>

            <form onSubmit={logHours} className='space-y-4'>
              <div className='mb-4'>
                <h3 className='font-medium text-gray-800 mb-2'>Log Time</h3>
                <p className='text-sm text-gray-600 mb-4'>
                  Record the time you&apos;ve spent working on this task.
                </p>

                <div className='flex items-end gap-2'>
                  <div className='flex-1'>
                    <InputField
                      label='Hours'
                      type='number'
                      value={hoursToLog.toString()}
                      onChange={(e) => setHoursToLog(parseFloat(e) || 0)}
                      min='0.25'
                      step='0.25'
                    />
                  </div>

                  <div className='mb-1'>
                    <Button
                      variant='secondary'
                      className='px-2 py-1 text-xs'
                      onClick={() => setHoursToLog(0.5)}
                    >
                      0.5h
                    </Button>
                  </div>

                  <div className='mb-1'>
                    <Button
                      variant='secondary'
                      className='px-2 py-1 text-xs'
                      onClick={() => setHoursToLog(1)}
                    >
                      1h
                    </Button>
                  </div>

                  <div className='mb-1'>
                    <Button
                      variant='secondary'
                      className='px-2 py-1 text-xs'
                      onClick={() => setHoursToLog(2)}
                    >
                      2h
                    </Button>
                  </div>
                </div>
              </div>

              <div className='flex justify-end space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsHoursModalOpen(false);
                    setLoggingHoursTicket(null);
                    setHoursToLog(0);
                  }}
                >
                  Cancel
                </Button>
                <Button type='submit'>Log Hours</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AuthLayout>
  );
}
