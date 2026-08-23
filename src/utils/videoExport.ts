/**
 * Video export utility using the MediaRecorder API.
 * Records the animated background canvas + narration overlay into a WebM video.
 */

export interface VideoExportOptions {
  /** The target canvas element to record */
  canvas: HTMLCanvasElement;
  /** Duration in milliseconds */
  durationMs: number;
  /** Video filename (without extension) */
  filename: string;
  /** Target framerate (default: 30) */
  fps?: number;
  /** Callback when recording starts */
  onStart?: () => void;
  /** Callback with progress 0-1 */
  onProgress?: (progress: number) => void;
  /** Callback when recording finishes */
  onComplete?: (blob: Blob) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export function isRecordingSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
}

export function recordCanvasToVideo(options: VideoExportOptions): { stop: () => void } {
  const {
    canvas,
    durationMs,
    filename,
    fps = 30,
    onStart,
    onProgress,
    onComplete,
    onError,
  } = options;

  if (!isRecordingSupported()) {
    onError?.('Your browser does not support video recording (MediaRecorder API).');
    return { stop: () => {} };
  }

  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];

  // Prefer VP9 > VP8 > default
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType: supportedMime,
      videoBitsPerSecond: 2_500_000, // 2.5 Mbps
    });
  } catch {
    onError?.('Failed to initialize video recorder.');
    return { stop: () => {} };
  }

  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: supportedMime });
    onComplete?.(blob);

    // Auto-download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  recorder.onerror = () => {
    onError?.('Recording failed unexpectedly.');
  };

  // Start recording
  recorder.start(100); // collect data every 100ms
  onStart?.();

  // Progress tracking
  const startTime = Date.now();
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    onProgress?.(progress);
    if (progress >= 1) {
      clearInterval(progressInterval);
    }
  }, 200);

  // Auto-stop after duration
  const stopTimeout = setTimeout(() => {
    clearInterval(progressInterval);
    if (recorder.state === 'recording') {
      recorder.stop();
    }
  }, durationMs);

  return {
    stop: () => {
      clearTimeout(stopTimeout);
      clearInterval(progressInterval);
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    },
  };
}
