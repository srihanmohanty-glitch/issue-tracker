import { useState, useEffect } from 'react';
import { issues } from '../services/api';

interface Issue {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  images?: string[];
  createdBy?: {
    email: string;
  };
  response?: {
    text: string;
    images: string[];
    respondedBy?: {
      email: string;
    };
    respondedAt: string;
  };
}

const AdminDashboard = () => {
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await issues.getAll();
      // Sort issues: pending first, then in-progress, then resolved
      const sortedIssues = data.sort((a: Issue, b: Issue) => {
        const statusOrder = { pending: 0, 'in-progress': 1, resolved: 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
               (statusOrder[b.status as keyof typeof statusOrder] || 0);
      });
      setIssueList(sortedIssues);
    } catch (error: any) {
      setError('Failed to load issues. Please try again.');
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        alert('You can only upload up to 5 images');
        return;
      }
      
      // Validate file sizes
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit
      if (validFiles.length !== filesArray.length) {
        alert('Some files were too large. Maximum size is 5MB per image.');
      }

      setImages(validFiles);
      const previewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreview(previewUrls);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await issues.updateStatus(issueId, newStatus);
      await fetchIssues(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Are you sure you want to delete this resolved issue? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await issues.deleteIssue(issueId);
      await fetchIssues(); // Refresh the list
      if (selectedIssue === issueId) {
        setSelectedIssue(null);
        setResponse('');
        setImages([]);
        setImagePreview([]);
      }
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      alert(error.response?.data?.message || 'Failed to delete issue. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitResponse = async (issueId: string) => {
    if (!response.trim()) {
      setSubmitError('Please enter a response message');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('text', response);
      images.forEach(image => {
        formData.append('images', image);
      });

      await issues.addResponse(issueId, formData);
      await fetchIssues(); // Refresh the list
      
      // Reset form
      setResponse('');
      setImages([]);
      setImagePreview([]);
      setSelectedIssue(null);
    } catch (error: any) {
      console.error('Error submitting response:', error);
      setSubmitError('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Issues</h3>
          {issueList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No issues to display</p>
            </div>
          ) : (
            issueList.map((issue) => (
              <div
                key={issue._id}
                className={`card cursor-pointer transition-colors ${
                  selectedIssue === issue._id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedIssue(issue._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{issue.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
                    {issue.createdBy && (
                      <p className="text-sm text-gray-500 mt-1">
                        From: {issue.createdBy.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                        className="text-sm border rounded p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      {issue.status === 'resolved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIssue(issue._id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={isDeleting}
                          title="Delete resolved issue"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                {issue.images && issue.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attached Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {issue.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:3000/${image}`}
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {issue.response && (
                  <div className="mt-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">{issue.response.text}</p>
                    {issue.response.respondedBy && (
                      <p className="text-xs text-blue-600 mt-1">
                        Responded by: {issue.response.respondedBy.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  Created on {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Response Form */}
        {selectedIssue && (
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Respond to Issue</h3>
            <div className="space-y-4">
              {submitError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Type your response here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Images (Max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="input"
                  max={5}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PNG, JPEG, JPG (max 5MB each)
                </p>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreview.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleSubmitResponse(selectedIssue)}
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;