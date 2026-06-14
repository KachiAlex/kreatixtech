import React, { createContext, useContext, useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`localStorage error for key "${key}":`, err);
    }
  };

  return [storedValue, setValue];
}

const AppContext = createContext(null);

const initialProjects = [
  {
    id: 1,
    title: 'FinTrack Pro',
    category: 'Web Application',
    description: 'A comprehensive financial management platform with real-time analytics, budget tracking, and AI-powered insights for SMEs.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'AI'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    demoUrl: 'https://demo.fintrackpro.example.com',
    demoType: 'url',
    demoImages: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    ],
    featured: true,
    year: 2024,
  },
  {
    id: 2,
    title: 'SecureVault MDM',
    category: 'Mobile Application',
    description: 'Enterprise mobile device management app enabling IT teams to remotely manage, secure and monitor thousands of endpoints.',
    tags: ['React Native', 'Python', 'AWS', 'MDM'],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    demoUrl: '',
    demoType: 'images',
    demoImages: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&q=80',
    ],
    featured: true,
    year: 2024,
  },
  {
    id: 3,
    title: 'CloudOps Dashboard',
    category: 'SaaS Platform',
    description: 'Multi-cloud infrastructure management platform with cost optimization, automated scaling and security compliance monitoring.',
    tags: ['Vue.js', 'Go', 'Kubernetes', 'Terraform'],
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    demoUrl: '',
    demoType: 'images',
    demoImages: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    ],
    featured: false,
    year: 2023,
  },
];

const initialVaptRequests = [
  {
    id: 'VAPT-2024-001',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    email: 'john@acmecorp.com',
    phone: '+234 801 234 5678',
    serviceType: 'Web Application VAPT',
    scope: 'E-commerce platform with 3 web apps, 2 APIs, and internal admin portal.',
    targetEnvironment: 'production',
    timeline: 'urgent',
    status: 'in_review',
    submittedAt: '2024-11-10T09:30:00Z',
    documents: ['scope_doc.pdf', 'network_diagram.pdf'],
    thread: [
      {
        id: 1,
        author: 'System',
        role: 'system',
        message: 'Your VAPT assessment request has been received. Our team will review and respond within 24 hours.',
        timestamp: '2024-11-10T09:30:00Z',
      },
      {
        id: 2,
        author: 'Kreatix Security Team',
        role: 'admin',
        message: 'Thank you for submitting your request. We have reviewed your scope and would like to schedule a discovery call to clarify a few details. Please let us know your availability.',
        timestamp: '2024-11-11T14:00:00Z',
      },
    ],
  },
];

export function AppProvider({ children }) {
  const [projects, setProjects] = useLocalStorage('kreatix_projects', initialProjects);
  const [vaptRequests, setVaptRequests] = useLocalStorage('kreatix_vapt_requests', initialVaptRequests);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  const addProject = (project) => {
    setProjects((prev) => [
      ...prev,
      { ...project, id: Date.now() },
    ]);
  };

  const updateProject = (id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const submitVaptRequest = (data) => {
    const newRequest = {
      ...data,
      id: `VAPT-${new Date().getFullYear()}-${String(vaptRequests.length + 1).padStart(3, '0')}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      thread: [
        {
          id: 1,
          author: 'System',
          role: 'system',
          message: 'Your VAPT assessment request has been received. Our security team will review and respond within 24 hours.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setVaptRequests((prev) => [...prev, newRequest]);
    return newRequest.id;
  };

  const addThreadMessage = (requestId, message, role = 'admin') => {
    setVaptRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            thread: [
              ...r.thread,
              {
                id: r.thread.length + 1,
                author: role === 'admin' ? 'Kreatix Security Team' : 'Client',
                role,
                message,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return r;
      })
    );
  };

  const updateVaptStatus = (requestId, status) => {
    setVaptRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const loginAdmin = (password) => {
    if (password === 'kreatix@admin2024') {
      setAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setAdminAuthenticated(false);

  return (
    <AppContext.Provider
      value={{
        projects,
        vaptRequests,
        adminAuthenticated,
        addProject,
        updateProject,
        deleteProject,
        submitVaptRequest,
        addThreadMessage,
        updateVaptStatus,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
