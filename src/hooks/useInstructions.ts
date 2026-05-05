import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchInstructions as fetchInstructionsThunk, 
  createInstruction as createInstructionThunk, 
  updateInstruction as updateInstructionThunk, 
  deleteInstruction as deleteInstructionThunk,
  fetchInstructionById as fetchInstructionByIdThunk,
  clearError 
} from '../store/instruction/instructionSlice';
import type { CreateInstructionPayload, Instruction } from '../types/instruction';

export const useInstructions = () => {
  const dispatch = useAppDispatch();
  const { instructions, isLoading, isActionLoading, error } = useAppSelector((state) => state.instruction);

  const fetchInstructions = useCallback(async () => {
    return dispatch(fetchInstructionsThunk()).unwrap();
  }, [dispatch]);

  const createInstruction = useCallback(async (payload: CreateInstructionPayload) => {
    return dispatch(createInstructionThunk(payload)).unwrap();
  }, [dispatch]);

  const updateInstruction = useCallback(async (id: string, payload: Partial<Instruction>) => {
    return dispatch(updateInstructionThunk({ id, payload })).unwrap();
  }, [dispatch]);

  const deleteInstruction = useCallback(async (id: string) => {
    return dispatch(deleteInstructionThunk(id)).unwrap();
  }, [dispatch]);

  const fetchInstructionById = useCallback(async (id: string) => {
    return dispatch(fetchInstructionByIdThunk(id)).unwrap();
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    instructions,
    isLoading,
    isActionLoading,
    error,
    fetchInstructions,
    createInstruction,
    updateInstruction,
    deleteInstruction,
    fetchInstructionById,
    clearError: handleClearError
  };
};
