import React, { useEffect, useRef, useState } from 'react';
import { getDeviceAudioUrl } from '../utils/offlineStorage';

export default function AudioPlayer({
  currentTrack,
  isPlaying,
  volume,
  seekTime,
  onTimeUpdate,
  onEnded,
}) {
  const ytPlayerRef = useRef(null);
  const audioRef = useRef(null);
  const [playMode, setPlayMode] = useState('youtube'); // 'offline' | 'youtube' | 'preview'
  const intervalRef = useRef(null);

  // Initialize YouTube Player
  useEffect(() => {
    function initYT() {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player('hidden-yt-player', {
          height: '1',
          width: '1',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                if (onEnded) onEnded();
              }
            },
            onError: (err) => {
              console.warn('[AudioPlayer] YT error, fallback to preview audio:', err);
              fallbackToPreview();
            },
          },
        });
      }
    }

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = initYT;
    }
  }, []);

  function fallbackToPreview() {
    setPlayMode('preview');
    if (ytPlayerRef.current && ytPlayerRef.current.stopVideo) {
      ytPlayerRef.current.stopVideo();
    }
    if (audioRef.current && currentTrack?.preview) {
      audioRef.current.src = currentTrack.preview;
      audioRef.current.volume = volume;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }

  // When track changes: check Device Cache / Offline first!
  useEffect(() => {
    if (!currentTrack) return;

    let isCancelled = false;

    async function setupPlayback() {
      // 1. Check if track is cached locally on this device (IndexedDB / Cache API)
      const deviceBlobUrl = await getDeviceAudioUrl(currentTrack);
      if (deviceBlobUrl) {
        if (isCancelled) return;
        setPlayMode('offline');
        if (ytPlayerRef.current && ytPlayerRef.current.stopVideo) {
          ytPlayerRef.current.stopVideo();
        }
        if (audioRef.current) {
          audioRef.current.src = deviceBlobUrl;
          audioRef.current.volume = volume;
          if (isPlaying) {
            audioRef.current.play().catch(e => console.warn('Offline blob play err:', e));
          }
        }
        return;
      }

      // 2. Check if track has server localUrl (on host machine)
      if (currentTrack.localUrl || currentTrack.isOffline) {
        if (isCancelled) return;
        setPlayMode('offline');
        if (ytPlayerRef.current && ytPlayerRef.current.stopVideo) {
          ytPlayerRef.current.stopVideo();
        }
        if (audioRef.current) {
          audioRef.current.src = currentTrack.localUrl;
          audioRef.current.volume = volume;
          if (isPlaying) {
            audioRef.current.play().catch(e => console.warn('Offline play err:', e));
          }
        }
        return;
      }

      // 3. Fallback: Stream online via YouTube
      try {
        const query = `${currentTrack.title} ${currentTrack.artist}`;
        const res = await fetch(`/api/yt-stream?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.videoId) {
          setPlayMode('youtube');
          if (audioRef.current) {
            audioRef.current.pause();
          }
          if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
            ytPlayerRef.current.loadVideoById(data.videoId);
            ytPlayerRef.current.setVolume(volume * 100);
            if (isPlaying) {
              ytPlayerRef.current.playVideo();
            }
          }
        } else {
          fallbackToPreview();
        }
      } catch (e) {
        fallbackToPreview();
      }
    }

    setupPlayback();

    return () => {
      isCancelled = true;
    };
  }, [currentTrack]);

  // Handle Play / Pause
  useEffect(() => {
    if (playMode === 'youtube') {
      if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playMode]);

  // Handle Volume change
  useEffect(() => {
    if (playMode === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(volume * 100);
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, playMode]);

  // Handle Seek
  useEffect(() => {
    if (seekTime === null || seekTime === undefined) return;
    if (playMode === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(seekTime, true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  // Time update ticker
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playMode === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const curr = ytPlayerRef.current.getCurrentTime() || 0;
        const dur = ytPlayerRef.current.getDuration() || (currentTrack?.duration || 180);
        if (onTimeUpdate && isPlaying) {
          onTimeUpdate(curr, dur);
        }
      } else if (audioRef.current) {
        const curr = audioRef.current.currentTime || 0;
        const dur = audioRef.current.duration || (currentTrack?.duration || 180);
        if (onTimeUpdate && isPlaying) {
          onTimeUpdate(curr, dur);
        }
      }
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playMode, isPlaying, currentTrack]);

  return (
    <div className="fixed bottom-0 right-0 pointer-events-none opacity-0 overflow-hidden w-px h-px z-[-100]">
      <div id="hidden-yt-player"></div>
      <audio
        ref={audioRef}
        onEnded={() => onEnded && onEnded()}
        onError={() => console.warn('[AudioPlayer] Audio playback error')}
      />
    </div>
  );
}
