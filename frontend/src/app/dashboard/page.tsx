"use client";

import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalProjects: number;
  activeSprints: number;
  completedTasks: number;
  pendingTasks: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  date: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeSprints: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                totalProjects: projectCount
                activeSprints: activeSprintCount
                completedTasks: ticketCountByStatus(status: RESOLVED)
                pendingTasks: ticketCountByStatus(status: TODO)
              }
            `,
          }),
        });

        const { data } = await response.json();

        setStats({
          totalProjects: data.totalProjects,
          activeSprints: data.activeSprints,
          completedTasks: data.completedTasks,
          pendingTasks: data.pendingTasks,
        });

        setRecentActivity([
          {
            _id: "1",
            type: "task",
            description: 'Task "Fix login bug" was completed',
            date: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            _id: "2",
            type: "sprint",
            description: 'Sprint "UI Improvements" was started',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "3",
            type: "project",
            description: 'New project "Mobile App" was created',
            date: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            _id: "4",
            type: "task",
            description: 'Task "Update documentation" was assigned to you',
            date: new Date(Date.now() - 259200000).toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AuthLayout>
      <div className='space-y-6'>
        {/* Welcome Section */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Welkom terug, {user?.name}!
          </h1>
          <p className='text-gray-600 mt-2'>
            Hier kan je zien wat gebeurt op jouw projecten vandaag.
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
            <h2 className='text-gray-500 text-sm font-medium uppercase'>
              Projecten
            </h2>
            <p className='mt-2 text-3xl font-bold text-gray-800'>
              {stats.totalProjects}
            </p>
            <Link
              href='/projects'
              className='mt-2 text-blue-500 text-sm hover:underline block'
            >
              Bekijk alle projecten →
            </Link>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
            <h2 className='text-gray-500 text-sm font-medium uppercase'>
              Actieve sprints
            </h2>
            <p className='mt-2 text-3xl font-bold text-gray-800'>
              {stats.activeSprints}
            </p>
            <Link
              href='/calendar'
              className='mt-2 text-green-500 text-sm hover:underline block'
            >
              Bekijk kalender →
            </Link>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
            <h2 className='text-gray-500 text-sm font-medium uppercase'>
              Voltooide taken
            </h2>
            <p className='mt-2 text-3xl font-bold text-gray-800'>
              {stats.completedTasks}
            </p>
            <Link
              href='/tasks'
              className='mt-2 text-purple-500 text-sm hover:underline block'
            >
              Bekijk taken →
            </Link>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500'>
            <h2 className='text-gray-500 text-sm font-medium uppercase'>
              Open taken
            </h2>
            <p className='mt-2 text-3xl font-bold text-gray-800'>
              {stats.pendingTasks}
            </p>
            <Link
              href='/tasks'
              className='mt-2 text-yellow-500 text-sm hover:underline block'
            >
              Bekijk taken →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>
            Recentie activiteit
          </h2>

          {loading ? (
            <div className='flex justify-center py-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className='flex items-start border-b border-gray-100 pb-4'
                >
                  <div
                    className={`
                    flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3
                    ${
                      activity.type === "task"
                        ? "bg-purple-100 text-purple-500"
                        : activity.type === "sprint"
                        ? "bg-green-100 text-green-500"
                        : "bg-blue-100 text-blue-500"
                    }
                  `}
                  >
                    {activity.type === "task"
                      ? "✓"
                      : activity.type === "sprint"
                      ? "🏃"
                      : "📁"}
                  </div>
                  <div className='flex-1'>
                    <p className='text-gray-800'>{activity.description}</p>
                    <p className='text-gray-500 text-sm'>
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>
            Snelle acties
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Link
              href='/projects'
              className='bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors'
            >
              <div className='text-2xl mb-2'>📁</div>
              <p className='text-gray-800 font-medium'>Nieuw project</p>
            </Link>
            <Link
              href='/tasks'
              className='bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors'
            >
              <div className='text-2xl mb-2'>✓</div>
              <p className='text-gray-800 font-medium'>Nieuwe taak</p>
            </Link>
            <Link
              href='/calendar'
              className='bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors'
            >
              <div className='text-2xl mb-2'>🏃</div>
              <p className='text-gray-800 font-medium'>Start sprint</p>
            </Link>
            <Link
              href='/profile'
              className='bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors'
            >
              <div className='text-2xl mb-2'>👤</div>
              <p className='text-gray-800 font-medium'>Bewerk profiel</p>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
