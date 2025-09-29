import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const IssueList = () => {
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the base URL for images
  const getImageUrl = (path: string) => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000'
      : `http://${window.location.hostname}:3000`;
    return `${baseUrl}/${path}`;
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await issues.getAll();
      setIssueList(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching issues');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!issueList || issueList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">No Issues Yet</h2>
          <p className="text-gray-600 mb-6">Be the first to submit an issue!</p>
          <Link 
            to="/submit-issue" 
            className="btn-primary inline-block"
          >
            Submit New Issue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Issues</h2>
        <Link 
          to="/submit-issue" 
          className="btn-primary"
        >
          Submit New Issue
        </Link>
      </div>
      <div className="space-y-6">
        {issueList.map((issue) => (
          <div key={issue._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{issue.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{issue.description}</p>
                {issue.createdBy && (
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by: {issue.createdBy.email}
                  </p>
                )}
              </div>
            </div>

            {issue.images && issue.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Attached Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(image)}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 rounded-lg">
                        <a
                          href={getImageUrl(image)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm">
                            View Full
                          </span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {issue.response && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Admin Response:</h4>
                <p className="text-blue-800">{issue.response.text}</p>
                {issue.response.respondedBy && (
                  <p className="text-sm text-blue-600 mt-1">
                    Responded by: {issue.response.respondedBy.email}
                  </p>
                )}
                
                {issue.response.images && issue.response.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Response Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {issue.response.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={getImageUrl(image)}
                            alt={`Response image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 rounded-lg">
                            <a
                              href={getImageUrl(image)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm">
                                View Full
                              </span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500">
                Created on {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueList;