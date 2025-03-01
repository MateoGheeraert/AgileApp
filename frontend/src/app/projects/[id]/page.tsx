"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Button from "@/app/components/Button";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          query: `
            query GetProject($id: ID!) {
              project(id: $id) {
                _id
                name
                description
                createdAt
              }
            }
          `,
          variables: { id: params.id },
        }),
      });

      const { data } = await response.json();
      if (data?.project) {
        setProject(data.project);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setError("Failed to fetch project details");
    }
  }, [params.id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (!project) {
    return <div className='p-4'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navbar */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16 items-center'>
            <Link
              href='/dashboard'
              className='text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto py-10 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg p-6'>
        {error && <div className='mb-4 text-red-500 text-center'>{error}</div>}

        <h1 className='text-3xl font-bold text-black'>{project.name}</h1>
        {project.description && (
          <p className='mt-2 text-gray-600 text-lg'>{project.description}</p>
        )}

        <div className='mt-6 flex justify-center'>
          <Button
            as='a'
            href={`/projects/${params.id}/sprints`}
            className='w-full max-w-xs'
          >
            View Sprints
          </Button>
        </div>
      </main>
    </div>
  );
}
