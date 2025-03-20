"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/app/components/AuthLayout";
import SprintsSection from "@/app/components/SprintSection";

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
    return (
      <AuthLayout>
        <div className='p-4'>Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <div className='mb-6'>
          <Link
            href='/dashboard'
            className='text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
          >
            ← Terug naar projecten
          </Link>
        </div>

        <div className='bg-white shadow-lg rounded-lg p-6'>
          {error && (
            <div className='mb-4 text-red-500 text-center'>{error}</div>
          )}

          <h1 className='text-3xl font-bold text-black'>{project.name}</h1>
          {project.description && (
            <p className='mt-2 text-gray-600 text-lg'>{project.description}</p>
          )}
          <SprintsSection
            projectId={
              Array.isArray(params.id) ? params.id[0] : params.id ?? ""
            }
          />
        </div>
      </div>
    </AuthLayout>
  );
}
