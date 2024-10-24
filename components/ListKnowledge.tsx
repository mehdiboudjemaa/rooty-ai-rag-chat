"use client";

import React, { useEffect, useState } from 'react';
import { listResources, deleteResource, updateResource, ResourceWithEmbeddings } from '../lib/actions/resources';

const ResourceList = () => {
  const [resources, setResources] = useState<ResourceWithEmbeddings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await listResources();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteResource(id);
      if (result === "Resource successfully deleted.") {
        setResources(resources.filter(resource => resource.resources.id !== id));
        setError(null);
      } else {
        setError(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting resource');
    }
  };

  const handleModify = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleUpdate = async (id: string) => {
    try {
      const result = await updateResource(id, editContent);
      if (result === "Resource successfully updated and re-embedded.") {
        setResources(resources.map(resource => 
          resource.resources.id === id 
            ? { ...resource, resources: { ...resource.resources, content: editContent } }
            : resource
        ));
        setEditingId(null);
        setEditContent('');
        setError(null);
      } else {
        setError(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating resource');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resources and Embeddings</h1>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      <ul className="space-y-4">
        {resources.map(({ resources: resource, embeddings }) => (
          <li key={resource.id} className="bg-white shadow-md rounded-lg p-4">
            {editingId === resource.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  rows={4}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(resource.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{resource.content}</h2>
                <p className="text-gray-500 text-sm">Created at: {new Date(resource.createdAt).toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Updated at: {new Date(resource.updatedAt).toLocaleString()}</p>
                <ul className="mt-2 space-y-2">
                  {embeddings ? (
                    <li key={embeddings.id} className="bg-gray-100 p-2 rounded">
                      <p>Embedding ID: {embeddings.id}</p>
                      <p>Embedding Content: {embeddings.content}</p>
                      <p>Embedding Vector: {JSON.stringify(embeddings.embedding)}</p>
                    </li>
                  ) : (
                    <li className="text-gray-500">No embeddings available</li>
                  )}
                </ul>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleModify(resource.id, resource.content)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Modify
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceList;