import { useState, useCallback } from 'react';
import { ChatMessage, Source } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_RESPONSES: Record<string, { content: string; sources: Source[] }> = {
  default: {
    content: `Based on your compliance documents, here's what I found:

**Key Requirements:**
1. You need to implement access controls and authentication mechanisms
2. Regular security assessments should be conducted quarterly
3. All data processing activities must be documented

**Recommendations:**
- Start with a gap analysis against the relevant framework
- Prioritize high-risk areas first
- Document all policies and procedures

Would you like me to elaborate on any of these points?`,
    sources: [
      { documentName: 'Security Policy.pdf', excerpt: 'Access controls must be implemented...', page: 12 },
      { documentName: 'Compliance Guide.pdf', excerpt: 'Regular assessments are required...', page: 5 },
    ],
  },
  soc2: {
    content: `For **SOC 2 compliance**, here are the key trust service criteria you need to address:

**Security (Common Criteria):**
- Logical and physical access controls
- System operations monitoring
- Change management processes

**Availability:**
- System backup and recovery procedures
- Business continuity planning

**Processing Integrity:**
- Quality assurance procedures
- Error handling mechanisms

Would you like specific guidance on any of these areas?`,
    sources: [
      { documentName: 'SOC 2 Framework.pdf', excerpt: 'The security principle refers to...', page: 8 },
    ],
  },
  gdpr: {
    content: `For **GDPR compliance**, here are the essential requirements:

**Data Subject Rights:**
- Right to access personal data
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to data portability

**Controller Obligations:**
- Maintain records of processing activities
- Conduct Data Protection Impact Assessments (DPIAs)
- Appoint a Data Protection Officer if required

**Lawful Basis for Processing:**
- Consent, contract, legal obligation, vital interests, public task, or legitimate interests

Need more details on implementation?`,
    sources: [
      { documentName: 'GDPR Guidelines.pdf', excerpt: 'Article 17 provides individuals with...', page: 23 },
    ],
  },
};

export function useChat() {
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (projectId: string, content: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), userMessage],
    }));

    setIsStreaming(true);

    // Determine which mock response to use
    const lowerContent = content.toLowerCase();
    let responseData = MOCK_RESPONSES.default;
    if (lowerContent.includes('soc 2') || lowerContent.includes('soc2')) {
      responseData = MOCK_RESPONSES.soc2;
    } else if (lowerContent.includes('gdpr')) {
      responseData = MOCK_RESPONSES.gdpr;
    }

    // Simulate streaming response
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources: responseData.sources,
    };

    setMessages(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), assistantMessage],
    }));

    // Stream the response character by character
    const fullContent = responseData.content;
    for (let i = 0; i <= fullContent.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      setMessages(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: fullContent.slice(0, i) }
            : m
        ),
      }));
    }

    setIsStreaming(false);
  }, []);

  const getProjectMessages = useCallback(
    (projectId: string) => messages[projectId] || [],
    [messages]
  );

  const clearChat = useCallback((projectId: string) => {
    setMessages(prev => ({ ...prev, [projectId]: [] }));
  }, []);

  return {
    sendMessage,
    getProjectMessages,
    clearChat,
    isStreaming,
  };
}
