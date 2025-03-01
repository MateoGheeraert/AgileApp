"use client";

import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/reusable/Button";
import Cookies from "js-cookie";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
}

interface TicketResponse {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  project?: {
    _id: string;
    name: string;
  };
  sprint?: {
    _id: string;
    name: string;
  };
  assignee?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED"
  >("ALL");

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

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
              ticketsWithDetails {
                _id
                title
                description
                status
                priority
                project {
                  _id
                  name
                }
                sprint {
                  _id
                  name
                }
                assignee {
                  _id
                  name
                }
                createdAt
              }
            }
          `,
        }),
      });

      console.log("Response:", response);
      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      console.log("Ticket data:", data.ticketsWithDetails);

      // Convert API response into correct structure
      let formattedTasks = data.ticketsWithDetails.map(
        (ticket: TicketResponse) => ({
          _id: ticket._id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status, // Keep original status (uppercase)
          priority: ticket.priority, // Keep original priority (uppercase)
          projectId: ticket.project?._id || "",
          projectName: ticket.project?.name || "Unknown Project",
          sprintId: ticket.sprint?._id || "",
          sprintName: ticket.sprint?.name || "Unknown Sprint",
          assigneeId: ticket.assignee?._id || "",
          assigneeName: ticket.assignee?.name || "Unassigned",
          createdAt: ticket.createdAt,
        })
      );

      // Apply filter before updating state
      if (filter !== "ALL") {
        formattedTasks = formattedTasks.filter(
          (task: Task) => task.status === filter
        );
      }

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => tasks;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-purple-100 text-purple-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "URGENT":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Tasks</h1>
          <p className='text-gray-600'>
            Manage and track all your tasks across projects
          </p>
        </div>

        {error && (
          <div className='bg-red-100 text-red-800 p-4 rounded-lg'>{error}</div>
        )}

        {/* Filters */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "ALL"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilter("TODO")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "TODO"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter("IN_PROGRESS")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "IN_PROGRESS"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("IN_REVIEW")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "IN_REVIEW"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              In Review
            </button>
            <button
              onClick={() => setFilter("RESOLVED")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "RESOLVED"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='space-y-4'>
            {getFilteredTasks().length === 0 ? (
              <div className='text-center py-12 bg-white rounded-lg shadow-md'>
                <p className='text-gray-500'>
                  No tasks found with the selected filter.
                </p>
              </div>
            ) : (
              getFilteredTasks().map((task: Task) => (
                <div
                  key={task._id}
                  className='bg-white p-4 rounded-lg shadow-md'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-medium text-lg'>{task.title}</h3>
                      <p className='text-gray-500 text-sm'>
                        Project: {task.projectName}
                      </p>
                      {task.sprintName && (
                        <p className='text-gray-500 text-sm'>
                          Sprint: {task.sprintName}
                        </p>
                      )}
                    </div>
                    <div className='flex space-x-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className='mt-2 text-gray-700'>{task.description}</p>
                  )}

                  <div className='mt-4 flex flex-wrap justify-between text-sm text-gray-500'>
                    <div className='space-y-1'>
                      <p>Assignee: {task.assigneeName}</p>
                      <p className='text-xs italic'>Assign in ticket details</p>
                    </div>
                    <p>Created: {formatDate(task.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Task Button */}
        <div className='fixed bottom-8 right-8'>
          <Button className='rounded-full w-14 h-14 flex items-center justify-center text-2xl'>
            +
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
