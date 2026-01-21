import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Eye, FileText, Clock, User, Mail, Phone, ChevronDown } from 'lucide-react';
import { verificationAPI } from '../../../api';

interface PendingUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  documents: Array<{
    id: number;
    fileName: string;
    filePath: string;
    documentType: string;
    uploadedAt: string;
  }>;
}

const UserVerification: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ id: number; fileName: string; url: string } | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const roleEntries = useMemo(() => {
    const grouped = pendingUsers.reduce<Record<string, PendingUser[]>>((acc, user) => {
      const roleKey = user.role?.trim() ? user.role : 'Unknown';
      if (!acc[roleKey]) {
        acc[roleKey] = [];
      }
      acc[roleKey].push(user);
      return acc;
    }, {});

    const roleOrder = ['Hospital', 'Patient', 'Donor', 'Admin', 'Unknown'];
    return Object.entries(grouped).sort(([roleA], [roleB]) => {
      const indexA = roleOrder.indexOf(roleA);
      const indexB = roleOrder.indexOf(roleB);
      if (indexA === -1 && indexB === -1) return roleA.localeCompare(roleB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [pendingUsers]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    if (roleEntries.length === 0) {
      setExpandedRoles(new Set());
      return;
    }

    setExpandedRoles(prev => {
      const next = new Set(prev);
      const availableRoles = new Set(roleEntries.map(([role]) => role));

      Array.from(next).forEach(role => {
        if (!availableRoles.has(role)) {
          next.delete(role);
        }
      });

      if (next.size === 0) {
        next.add(roleEntries[0][0]);
      }

      return next;
    });
  }, [roleEntries]);

  const toggleRole = (role: string) => {
    setExpandedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await verificationAPI.getPendingVerifications();
      if (response.success) {
        setPendingUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await verificationAPI.approveUser(userId);
      if (response.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        alert('User approved successfully!');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user');
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) return;
    
    try {
      const response = await verificationAPI.rejectUser(selectedUser.id, rejectReason);
      if (response.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedUser(null);
        alert('User rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user');
    }
  };

  const handleViewDocument = async (doc: { id: number; fileName: string }) => {
    setLoadingDocument(true);
    try {
      const url = await verificationAPI.getDocumentUrl(doc.id);
      setViewingDocument({ id: doc.id, fileName: doc.fileName, url });
    } catch (error) {
      console.error('Error fetching document URL:', error);
      alert('Failed to load document');
    } finally {
      setLoadingDocument(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Verification</h1>
        <p className="text-gray-600">Review and verify user documents</p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
          <p className="text-gray-500">All users have been verified</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roleEntries.map(([role, users]) => {
            const isExpanded = expandedRoles.has(role);
            return (
              <div key={role} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleRole(role)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-gray-900">{role}</div>
                      <div className="text-sm text-gray-500">{users.length} pending</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{user.fullName}</h3>
                              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Pending Verification
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Documents</h4>
                          <div className="space-y-2">
                            {user.documents.length === 0 ? (
                              <div className="text-sm text-gray-500 bg-white p-3 rounded border">
                                No documents uploaded.
                              </div>
                            ) : (
                              user.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">{doc.fileName}</span>
                                  </div>
                                  <button
                                    onClick={() => handleViewDocument({ id: doc.id, fileName: doc.fileName })}
                                    disabled={loadingDocument}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject User Verification</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedUser?.fullName}'s verification:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{viewingDocument.fileName}</h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <img
                src={viewingDocument.url}
                alt={viewingDocument.fileName}
                className="max-w-full h-auto mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="text-center text-gray-500 py-8">Unable to load document.</div>';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerification;
