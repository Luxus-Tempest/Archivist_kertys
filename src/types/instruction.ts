export interface Instruction {
  id: string;
  classId: number;
  className: string;
  content: string;
  updatedAt: string;
}

export interface InstructionState {
  instructions: Instruction[];
  totalCount: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

export interface FetchInstructionsResponse {
  totalCount: number;
  instructions: Instruction[];
}

export interface CreateInstructionPayload {
  classId: number;
  className: string;
  content: string;
}
