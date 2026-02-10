import API_URL from './config';

const API_BASE = `${API_URL}/api/chat`;

export const messageStore = {
    getChats: async (token) => {
        const response = await fetch(`${API_BASE}/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    },

    getMessages: async (conversationId, token) => {
        const response = await fetch(`${API_BASE}/messages/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    addMessage: async (conversationId, text, token) => {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ conversation_id: conversationId, text })
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },

    findOrCreateConversation: async (mentorId, studentId, token) => {
        const response = await fetch(`${API_BASE}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mentor_id: mentorId, student_id: studentId })
        });
        if (!response.ok) throw new Error('Failed to find or create conversation');
        return response.json();
    },

    markAsRead: async (conversationId, token) => {
        const response = await fetch(`${API_BASE}/read/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to mark messages as read');
        return response.json();
    }
};
