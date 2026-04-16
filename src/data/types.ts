export interface Project {
  id: string;
  name: string;
  originalPrompt: string;
  kickoffThreadUrl: string;
  phase2Prompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Phase1Item {
  id: string;
  projectId: string;
  sequenceNumber: number;
  promptText: string;
  conversationUrl: string;
  artifactUrl: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
