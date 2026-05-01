export interface Instruction {
  id: string;
  classId: number;
  className: string;
  content: string;
  updatedAt: string;
}

export interface InstructionState {
  instructions: Instruction[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

export interface CreateInstructionPayload {
  classId: number;
  className: string;
  content: string;
}
