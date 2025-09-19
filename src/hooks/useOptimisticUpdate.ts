"use client";

import { useState, useCallback, useRef } from 'react';

export interface OptimisticAction<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
}

export interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (action: OptimisticAction<T>) => void;
  onError?: (action: OptimisticAction<T>, error: Error) => void;
  timeout?: number; // Auto-revert after timeout
}

export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[],
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const { onSuccess, onError, timeout = 10000 } = options;
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);
  const [pendingActions, setPendingActions] = useState<OptimisticAction<T>[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update optimistic data when initial data changes
  const updateBaseData = useCallback((newData: T[]) => {
    setOptimisticData(() => {
      // Merge new base data with pending optimistic changes
      const pendingChanges = new Map(
        pendingActions.map(action => [action.data.id, action])
      );

      return newData.map(item => {
        const pendingChange = pendingChanges.get(item.id);
        if (pendingChange && pendingChange.type === 'update') {
          return { ...item, ...pendingChange.data };
        }
        return item;
      }).filter(item => {
        const pendingChange = pendingChanges.get(item.id);
        return !pendingChange || pendingChange.type !== 'delete';
      });
    });
  }, [pendingActions]);

  const addPendingAction = useCallback((action: OptimisticAction<T>) => {
    setPendingActions(prev => [...prev, action]);

    // Set timeout for auto-revert
    const timeoutId = setTimeout(() => {
      // revertAction will be defined when this is called
      revertAction(action.id);
      onError?.(action, new Error('Operation timed out'));
    }, timeout);

    timeoutRefs.current.set(action.id, timeoutId);
  }, [timeout, onError]);

  const removePendingAction = useCallback((actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));

    const timeoutId = timeoutRefs.current.get(actionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(actionId);
    }
  }, []);

  const revertAction = useCallback((actionId: string) => {
    const action = pendingActions.find(a => a.id === actionId);
    if (!action) return;

    setOptimisticData(prev => {
      switch (action.type) {
        case 'add':
          return prev.filter(item => item.id !== action.data.id);
        case 'update':
          if (action.originalData) {
            return prev.map(item =>
              item.id === action.data.id ? action.originalData! : item
            );
          }
          return prev;
        case 'delete':
          if (action.originalData) {
            return [...prev, action.originalData];
          }
          return prev;
        default:
          return prev;
      }
    });

    removePendingAction(actionId);
  }, [pendingActions, removePendingAction]);

  // Optimistic add
  const optimisticAdd = useCallback(async (
    newItem: T,
    asyncAction: () => Promise<T>
  ): Promise<T> => {
    const actionId = `add-${Date.now()}-${Math.random()}`;
    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'add',
      data: newItem,
      timestamp: Date.now(),
    };

    // Apply optimistic update
    setOptimisticData(prev => [...prev, newItem]);
    addPendingAction(action);

    try {
      const result = await asyncAction();

      // Success: replace optimistic item with real result
      setOptimisticData(prev =>
        prev.map(item => item.id === newItem.id ? result : item)
      );
      removePendingAction(actionId);
      onSuccess?.(action);

      return result;
    } catch (error) {
      // Error: revert optimistic update
      revertAction(actionId);
      onError?.(action, error as Error);
      throw error;
    }
  }, [addPendingAction, removePendingAction, revertAction, onSuccess, onError]);

  // Optimistic update
  const optimisticUpdate = useCallback(async (
    updatedItem: T,
    asyncAction: () => Promise<T>
  ): Promise<T> => {
    const actionId = `update-${Date.now()}-${Math.random()}`;
    const originalItem = optimisticData.find(item => item.id === updatedItem.id);

    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'update',
      data: updatedItem,
      originalData: originalItem,
      timestamp: Date.now(),
    };

    // Apply optimistic update
    setOptimisticData(prev =>
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    addPendingAction(action);

    try {
      const result = await asyncAction();

      // Success: replace optimistic item with real result
      setOptimisticData(prev =>
        prev.map(item => item.id === updatedItem.id ? result : item)
      );
      removePendingAction(actionId);
      onSuccess?.(action);

      return result;
    } catch (error) {
      // Error: revert optimistic update
      revertAction(actionId);
      onError?.(action, error as Error);
      throw error;
    }
  }, [optimisticData, addPendingAction, removePendingAction, revertAction, onSuccess, onError]);

  // Optimistic delete
  const optimisticDelete = useCallback(async (
    itemId: string,
    asyncAction: () => Promise<void>
  ): Promise<void> => {
    const actionId = `delete-${Date.now()}-${Math.random()}`;
    const originalItem = optimisticData.find(item => item.id === itemId);

    if (!originalItem) {
      throw new Error('Item not found');
    }

    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'delete',
      data: originalItem,
      originalData: originalItem,
      timestamp: Date.now(),
    };

    // Apply optimistic update
    setOptimisticData(prev => prev.filter(item => item.id !== itemId));
    addPendingAction(action);

    try {
      await asyncAction();

      // Success: keep item removed
      removePendingAction(actionId);
      onSuccess?.(action);
    } catch (error) {
      // Error: revert optimistic update
      revertAction(actionId);
      onError?.(action, error as Error);
      throw error;
    }
  }, [optimisticData, addPendingAction, removePendingAction, revertAction, onSuccess, onError]);

  // Confirm pending action (when server confirms)
  const confirmAction = useCallback((actionId: string) => {
    removePendingAction(actionId);
  }, [removePendingAction]);

  const isPending = pendingActions.length > 0;

  return {
    data: optimisticData,
    pendingActions,
    isPending,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    confirmAction,
    revertAction,
    updateBaseData,
  };
}