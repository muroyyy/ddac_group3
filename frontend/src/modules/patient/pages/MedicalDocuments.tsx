import { useState, useEffect } from 'react';
import React from 'react';
// React tools to store data and run code when the page loads

import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from '../../../api/client';
// Used to communicate securely with the backend API

import { useAuth } from '../../../context/AuthContext';
// Used to know which patient is currently logged in


// This describes the structure of a document returned from backend
interface Document {
  documentId: number;
  documentName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}

export default function MedicalDocuments() {

  // Stores all documents belonging to the patient
  const [documents, setDocuments] = useState<Document[]>([]);

  // Tracks whether a file is currently uploading
  const [uploading, setUploading] = useState(false);

  // Stores the file selected by the user
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get the logged-in patient
  const { user } = useAuth();
  const userId = user?.id;

  // Used to reset the file input after upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // When the page loads or user changes, load documents
  useEffect(() => {
    if (userId) loadDocuments();
  }, [userId]);


  // Fetch all documents for this patient from backend
  const loadDocuments = async () => {

    // Stop if user is not logged in
    if (!userId) return;

    try {
      // Send GET request to backend
      const res = await authenticatedFetch(
        `${API_BASE_URL}/patient/documents/${userId}`,
        { method: 'GET' }
      );

      // Convert response to JSON
      const data = await parseJsonResponse(res);

      // If successful, store documents in state
      if (data.success) {
        setDocuments(data.data);
      }

    } catch (err) {
      // Log error if documents fail to load
      console.error('Failed to load documents:', err);
    }
  };


  // Runs when the user selects a file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    // Get the first selected file
    const file = e.target.files?.[0];

    if (file) {
      // Store selected file in state
      setSelectedFile(file);
    }
  };


  // Runs when user clicks "Upload Document"
  const handleUpload = async () => {

    // Stop if no file or user is missing
    if (!selectedFile || !userId) return;

    // Show uploading state
    setUploading(true);

    // Prepare file to send to backend
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Send file to backend
      const res = await fetch(
        `${API_BASE_URL}/patient/upload-document/${userId}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include'
        }
      );

      // Convert backend response
      const data = await res.json();

      if (data.success) {
        // Notify user of success
        alert('Document uploaded successfully');

        // Clear selected file
        setSelectedFile(null);

        // Reset file input field
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Reload document list
        loadDocuments();

      } else {
        // Show backend error
        alert('Upload failed: ' + (data.message || data.error || 'Unknown error'));
      }

    } catch (err) {
      // Handle network or upload error
      alert('Upload failed: Network error');

    } finally {
      // Stop uploading state
      setUploading(false);
    }
  };


  // Runs when user clicks "Delete"
  const handleDelete = async (documentId: number) => {

    // Ask for confirmation before deleting
    if (!confirm('Delete this document?')) return;

    try {
      // Send DELETE request to backend
      const res = await authenticatedFetch(
        `${API_BASE_URL}/patient/document/${documentId}`,
        { method: 'DELETE' }
      );

      const data = await parseJsonResponse(res);

      if (data.success) {
        // Notify user
        alert('Document deleted');

        // Reload document list
        loadDocuments();
      }

    } catch (err) {
      // Show error if delete fails
      alert('Delete failed');
    }
  };


  // Convert file size to readable format (KB / MB)
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold text-red-800 mb-6">
          Medical Documents
        </h1>

        {/* UPLOAD SECTION */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Upload New Document
          </h2>

          <div className="flex items-center gap-4">
            {/* STYLED FILE INPUT BUTTON */}
            <label className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition">
              Choose File
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* SHOW SELECTED FILE NAME */}
            {selectedFile && (
              <span className="text-sm text-gray-600">
                Selected: {selectedFile.name}
              </span>
            )}
          </div>

          {/* SHOW UPLOAD BUTTON ONLY WHEN FILE IS SELECTED */}
          {selectedFile && (
            <div className="mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          )}
        </div>

        {/* DOCUMENT LIST */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">

              {/* TABLE HEADER */}
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Document Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Size</th>
                  <th className="px-6 py-4 text-left font-semibold">Uploaded</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-200">

                {/* If no documents exist */}
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No documents uploaded yet
                    </td>
                  </tr>
                ) : (
                  // Show each document
                  documents.map((doc) => (
                    <tr key={doc.documentId} className="hover:bg-gray-50 transition">
                      {/* DOCUMENT NAME WITH TRUNCATION */}
                      <td className="px-6 py-4">
                        <div 
                          className="max-w-xs truncate" 
                          title={doc.documentName}
                        >
                          {doc.documentName}
                        </div>
                      </td>
                      
                      {/* FILE SIZE */}
                      <td className="px-6 py-4 text-gray-600">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      
                      {/* UPLOAD DATE */}
                      <td className="px-6 py-4 text-gray-600">
                        {doc.uploadedAt}
                      </td>
                      
                      {/* ACTIONS WITH PROPER SPACING */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* VIEW DOCUMENT */}
                          <a 
                            href={doc.url} 
                            target="_blank"
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                          >
                            View
                          </a>

                          {/* DELETE DOCUMENT */}
                          <button 
                            onClick={() => handleDelete(doc.documentId)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
