"use client";

import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">(
    "all"
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch this from your API
      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data
      const mockTasks: Task[] = [
        {
          _id: "1",
          title: "Create login page",
          description:
            "Implement the login page with email and password fields",
          status: "done",
          priority: "high",
          projectId: "p1",
          projectName: "Website Redesign",
          sprintId: "s1",
          sprintName: "Sprint 1: Initial Setup",
          assigneeId: "u1",
          assigneeName: "John Doe",
          createdAt: "2023-05-15T10:00:00Z",
        },
        {
          _id: "2",
          title: "Implement authentication",
          description: "Set up JWT authentication with refresh tokens",
          status: "done",
          priority: "high",
          projectId: "p1",
          projectName: "Website Redesign",
          sprintId: "s1",
          sprintName: "Sprint 1: Initial Setup",
          assigneeId: "u1",
          assigneeName: "John Doe",
          createdAt: "2023-05-16T10:00:00Z",
        },
        {
          _id: "3",
          title: "Create dashboard layout",
          description:
            "Design and implement the main dashboard layout with sidebar",
          status: "in_progress",
          priority: "medium",
          projectId: "p1",
          projectName: "Website Redesign",
          sprintId: "s2",
          sprintName: "Sprint 2: Core Features",
          assigneeId: "u2",
          assigneeName: "Jane Smith",
          createdAt: "2023-05-20T10:00:00Z",
        },
        {
          _id: "4",
          title: "Implement project creation",
          description: "Create form and API for adding new projects",
          status: "todo",
          priority: "medium",
          projectId: "p1",
          projectName: "Website Redesign",
          sprintId: "s2",
          sprintName: "Sprint 2: Core Features",
          createdAt: "2023-05-22T10:00:00Z",
        },
        {
          _id: "5",
          title: "Design mobile wireframes",
          description: "Create wireframes for mobile app screens",
          status: "todo",
          priority: "low",
          projectId: "p2",
          projectName: "Mobile App",
          sprintId: "s3",
          sprintName: "Sprint 1: Planning",
          createdAt: "2023-06-01T10:00:00Z",
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
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
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilter("todo")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "todo"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "in_progress"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("done")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "done"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Done
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
              getFilteredTasks().map((task) => (
                <div
                  key={task._id}
                  className='bg-white p-4 rounded-lg shadow-md'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-medium text-lg'>{task.title}</h3>
                      <p className='text-gray-500 text-sm'>
                        {task.projectName}
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className='mt-2 text-gray-700'>{task.description}</p>
                  )}

                  <div className='mt-4 flex flex-wrap justify-between text-sm text-gray-500'>
                    <div className='space-y-1'>
                      {task.sprintName && <p>Sprint: {task.sprintName}</p>}
                      {task.assigneeName && (
                        <p>Assignee: {task.assigneeName}</p>
                      )}
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
