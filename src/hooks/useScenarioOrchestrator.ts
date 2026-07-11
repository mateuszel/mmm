"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  criticalAssets,
  scenarios,
  stageAt,
  stageIndexAt,
  type ScenarioId,
} from "@/lib/demo/scenario-data";

type PlaybackStatus = "home" | "playing" | "paused" | "awaiting-approval" | "final";

const APPROVAL_AT_MS = 5_000;
const CALL_DURATION_MS = 32_132.514;
const CALL_PLAYBACK_RATE = 1.3;

function isAudioAsset(path: string) {
  return /\.(m4a|mp3|wav|ogg)$/i.test(path);
}

function preloadAsset(path: string) {
  return new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 8_000);
    const done = () => {
      window.clearTimeout(timeout);
      resolve();
    };

    if (isAudioAsset(path)) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.addEventListener("loadedmetadata", done, { once: true });
      audio.addEventListener("error", done, { once: true });
      audio.src = path;
      audio.load();
      return;
    }

    const image = new Image();
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
    image.src = path;
  });
}

export function useScenarioOrchestrator(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const [scenarioId, setScenarioId] = useState<ScenarioId | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>("home");
  const [callApproved, setCallApproved] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetProgress, setAssetProgress] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [recording, setRecording] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const elapsedRef = useRef(0);
  const scenarioRef = useRef<ScenarioId | null>(null);
  const statusRef = useRef<PlaybackStatus>("home");
  const approvedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const testModeRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    recordingRef.current = params.get("recording") === "1";
    testModeRef.current = params.get("test") === "1";
    setRecording(recordingRef.current);
    setTestMode(testModeRef.current);
    setHydrated(true);

    let mounted = true;
    let completed = 0;
    void Promise.all(
      criticalAssets.map((asset) => preloadAsset(asset).then(() => {
        completed += 1;
        if (mounted) setAssetProgress(completed / criticalAssets.length);
      })),
    ).then(() => {
      if (mounted) setAssetsReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = CALL_PLAYBACK_RATE;
    audio.preservesPitch = true;
  }, [audioRef]);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastFrameRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancelFrame();
    stopAudio();
    scenarioRef.current = null;
    statusRef.current = "home";
    approvedRef.current = false;
    elapsedRef.current = 0;
    setScenarioId(null);
    setElapsedMs(0);
    setStatus("home");
    setCallApproved(false);
    setSessionKey((value) => value + 1);
    document.documentElement.dataset.demoPlaying = "false";
    document.body.style.cursor = "";
  }, [cancelFrame, stopAudio]);

  const start = useCallback((nextScenario: ScenarioId) => {
    if (scenarioRef.current !== null) return;
    if (recordingRef.current && !assetsReady) return;
    cancelFrame();
    stopAudio();
    scenarioRef.current = nextScenario;
    statusRef.current = "playing";
    approvedRef.current = false;
    elapsedRef.current = 0;
    setScenarioId(nextScenario);
    setElapsedMs(0);
    setStatus("playing");
    setCallApproved(false);
    setSessionKey((value) => value + 1);
    document.documentElement.dataset.demoPlaying = "true";
  }, [assetsReady, cancelFrame, stopAudio]);

  const approveCall = useCallback(() => {
    if (scenarioRef.current !== "foreign" || approvedRef.current) return;
    approvedRef.current = true;
    setCallApproved(true);
    statusRef.current = "playing";
    setStatus("playing");
    lastFrameRef.current = null;

    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.playbackRate = CALL_PLAYBACK_RATE;
    audio.preservesPitch = true;
    audio.muted = testModeRef.current;
    if (!testModeRef.current) void audio.play().catch(() => undefined);
  }, [audioRef]);

  const togglePause = useCallback(() => {
    if (!scenarioRef.current || statusRef.current === "awaiting-approval" || statusRef.current === "final") return;
    const next = statusRef.current === "paused" ? "playing" : "paused";
    statusRef.current = next;
    setStatus(next);
    lastFrameRef.current = null;

    const audio = audioRef.current;
    if (!audio || !approvedRef.current) return;
    if (next === "paused") audio.pause();
    else if (!testModeRef.current) void audio.play().catch(() => undefined);
  }, [audioRef]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r" || event.key === "Escape") {
        event.preventDefault();
        reset();
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (scenarioRef.current !== null) return;
      if (event.key === "1") start("retail");
      if (event.key === "2") start("private");
      if (event.key === "3") start("foreign");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset, start, togglePause]);

  useEffect(() => {
    if (!scenarioId || status !== "playing") return;
    const definition = scenarios[scenarioId];
    const speed = testModeRef.current ? 10 : 1;

    const tick = (time: number) => {
      const previous = lastFrameRef.current ?? time;
      lastFrameRef.current = time;
      elapsedRef.current = Math.min(definition.durationMs, elapsedRef.current + (time - previous) * speed);

      if (scenarioId === "foreign" && !approvedRef.current && elapsedRef.current >= APPROVAL_AT_MS) {
        elapsedRef.current = APPROVAL_AT_MS;
        setElapsedMs(APPROVAL_AT_MS);
        statusRef.current = "awaiting-approval";
        setStatus("awaiting-approval");
        document.body.style.cursor = "auto";
        return;
      }

      if (scenarioId === "foreign" && approvedRef.current) {
        const callElapsed = Math.max(0, elapsedRef.current - APPROVAL_AT_MS);
        const audio = audioRef.current;
        const targetAudioMs = callElapsed * CALL_PLAYBACK_RATE;
        if (audio && !testModeRef.current && callElapsed < CALL_DURATION_MS && Math.abs(audio.currentTime * 1_000 - targetAudioMs) > 350) {
          audio.currentTime = targetAudioMs / 1_000;
        }
      }

      setElapsedMs(elapsedRef.current);
      if (elapsedRef.current >= definition.durationMs) {
        statusRef.current = "final";
        setStatus("final");
        stopAudio();
        document.body.style.cursor = "";
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return cancelFrame;
  }, [audioRef, cancelFrame, scenarioId, status, stopAudio]);

  useEffect(() => () => {
    cancelFrame();
    stopAudio();
  }, [cancelFrame, stopAudio]);

  const scenario = scenarioId ? scenarios[scenarioId] : null;
  const stage = useMemo(() => {
    if (!scenario) return null;
    if (scenario.id === "foreign" && !callApproved && elapsedMs >= APPROVAL_AT_MS) {
      return scenario.stages.find((candidate) => candidate.id === "approval") ?? scenario.stages[0];
    }
    return stageAt(scenario, elapsedMs);
  }, [callApproved, elapsedMs, scenario]);
  const stageIndex = useMemo(() => scenario ? stageIndexAt(scenario, elapsedMs) : -1, [elapsedMs, scenario]);
  const stageElapsedMs = stage ? Math.max(0, elapsedMs - stage.startMs) : 0;
  const stageProgress = stage?.durationMs ? Math.min(1, stageElapsedMs / stage.durationMs) : 1;
  const callElapsedMs = scenarioId === "foreign" && callApproved ? Math.min(CALL_DURATION_MS, Math.max(0, elapsedMs - APPROVAL_AT_MS)) : 0;

  return {
    scenarioId,
    scenario,
    elapsedMs,
    status,
    stage,
    stageIndex,
    stageElapsedMs,
    stageProgress,
    callElapsedMs,
    callApproved,
    assetsReady,
    assetProgress,
    sessionKey,
    recording,
    testMode,
    hydrated,
    start,
    reset,
    approveCall,
    togglePause,
  };
}
