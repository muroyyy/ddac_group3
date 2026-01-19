import { useState, useEffect } from 'react';
import React from 'react';
import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

interface Document {
  documentId: number;
  documentName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}

export default function MedicalDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) loadDocuments();
  }, [userId]);

  const loadDocuments = async () => {
    if (!userId) return;
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/patient/documents/${userId}`, { method: 'GET' });
      const data = await parseJsonResponse(res);
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/patient/upload-document/${userId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Document uploaded successfully');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadDocuments();
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Delete this document?')) return;

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/patient/document/${documentId}`, { method: 'DELETE' });
      const data = await parseJsonResponse(res);
      if (data.success) {
        alert('Document deleted');
        loadDocuments();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-800 mb-6">Medical Documents</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h2>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
            {selectedFile && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Document Name</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-left">Uploaded</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No documents uploaded yet
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.documentId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{doc.documentName}</td>
                    <td className="px-4 py-3">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3">{doc.uploadedAt}</td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mr-4"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(doc.documentId)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
