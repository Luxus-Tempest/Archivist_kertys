export interface Instruction {
  id: string;
  classId: number;
  organizationId?: string;
  className: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

/*voici la reponse a pres la creation d'une instruction : {
    "message": "Instruction ajoutée",
    "entity": {
        "id": "4e986614-e088-40d1-8741-d4c2570d3b67",
        "organizationId": "872567857",
        "classId": 7,
        "className": "CIN",
        "content": "TEST test",
        "createdAt": "2026-05-05T14:15:11.1073573Z",
        "updatedAt": null
    }
}
  */
 export interface InstructionCreatedResponse {
  message: string;
  entity: Instruction;
}

export interface InstructionInput {
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
