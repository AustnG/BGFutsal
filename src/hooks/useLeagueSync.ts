import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PUBLISHED_SHEET_BASE,
  loadInitialData,
  saveLeagueDataToStorage,
  syncWithGoogleSheet,
} from '../services/googleSheetsSync';
import { INITIAL_LEAGUE_DATA } from '../data/initialLeagueData';
import { LeagueDatabase, SyncStatus } from '../types/league';

const BASE_POLL_MS = 60_000;
const MAX_BACKOFF_MS = 300_000;

export function useLeagueSync() {
  const [initial] = useState(() => loadInitialData());
  const [data, setData] = useState<LeagueDatabase>(initial.data);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(initial.syncStatus);

  const abortRef = useRef<AbortController | null>(null);
  const failureCountRef = useRef<number>(0);

  const syncSheet = useCallback(async (sheetUrl: string) => {
    const trimmed = sheetUrl.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const result = await syncWithGoogleSheet(trimmed, controller.signal);
      if (controller.signal.aborted) return;

      failureCountRef.current = 0;
      setData(result.data);
      setSyncStatus({
        lastSynced: new Date().toLocaleString(),
        isSyncing: false,
        error: null,
        sheetUrl: trimmed,
        dataSource: 'google-sheets',
        validationIssues: result.validationIssues,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      failureCountRef.current += 1;
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to sync with Google Sheet. Please check permissions.';
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: message,
      }));
    }
  }, []);

  const resetToBuiltIn = useCallback(() => {
    abortRef.current?.abort();
    failureCountRef.current = 0;
    setData(INITIAL_LEAGUE_DATA);
    saveLeagueDataToStorage(INITIAL_LEAGUE_DATA, '', 'built-in');
    setSyncStatus({
      lastSynced: null,
      isSyncing: false,
      error: null,
      sheetUrl: '',
      dataSource: 'built-in',
      validationIssues: [],
    });
  }, []);

  useEffect(() => {
    const envUrl = ((import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_GOOGLE_SHEET_URL || '').trim();
    const activeUrl =
      envUrl ||
      (syncStatus.dataSource === 'built-in' && !syncStatus.sheetUrl
        ? ''
        : syncStatus.sheetUrl || DEFAULT_PUBLISHED_SHEET_BASE);

    if (!activeUrl) {
      return () => abortRef.current?.abort();
    }

    let timeoutId: number | undefined;
    let isCancelled = false;

    const scheduleNext = () => {
      if (isCancelled) return;
      const backoffMultiplier = Math.min(2 ** failureCountRef.current, 5);
      const delay = Math.min(BASE_POLL_MS * backoffMultiplier, MAX_BACKOFF_MS);
      timeoutId = window.setTimeout(() => {
        if (!isCancelled && document.visibilityState === 'visible') {
          syncSheet(activeUrl).finally(scheduleNext);
        } else {
          scheduleNext();
        }
      }, delay);
    };

    syncSheet(activeUrl).finally(scheduleNext);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCancelled) {
        syncSheet(activeUrl);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      abortRef.current?.abort();
    };
  }, [syncStatus.sheetUrl, syncStatus.dataSource, syncSheet]);

  return {
    data,
    syncStatus,
    syncSheet,
    resetToBuiltIn,
  };
}
