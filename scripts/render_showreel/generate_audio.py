import math
import struct
import wave

# Audio Configuration
SAMPLE_RATE = 44100
DURATION = 15.0  # Exactly 15.000 seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 120.0
BEAT_DUR = 60.0 / BPM  # 0.5 seconds

# Waveform buffers (Left & Right)
left_channel = [0.0] * TOTAL_SAMPLES
right_channel = [0.0] * TOTAL_SAMPLES

def add_kick(start_time, strength=0.9):
    start_idx = int(start_time * SAMPLE_RATE)
    kick_len = int(0.22 * SAMPLE_RATE)
    for i in range(kick_len):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES:
            break
        t = i / SAMPLE_RATE
        # Pitch drop from 160Hz down to 42Hz
        freq = 42.0 + 118.0 * math.exp(-32.0 * t)
        env = math.exp(-14.0 * t) * strength
        val = math.sin(2.0 * math.pi * freq * t) * env
        left_channel[idx] += val
        right_channel[idx] += val

def add_hit(start_time, strength=0.7):
    start_idx = int(start_time * SAMPLE_RATE)
    hit_len = int(0.65 * SAMPLE_RATE)
    for i in range(hit_len):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES:
            break
        t = i / SAMPLE_RATE
        # Chord tones: C4 (261.6Hz), G4 (392.0Hz), D5 (587.3Hz)
        tone = (
            math.sin(2.0 * math.pi * 261.63 * t) * 0.4 +
            math.sin(2.0 * math.pi * 392.00 * t) * 0.35 +
            math.sin(2.0 * math.pi * 587.33 * t) * 0.25
        )
        env = math.exp(-6.0 * t) * strength
        left_channel[idx] += tone * env * 0.8
        right_channel[idx] += tone * env * 1.0

def add_riser(start_time, end_time, strength=0.55):
    start_idx = int(start_time * SAMPLE_RATE)
    end_idx = int(end_time * SAMPLE_RATE)
    dur = end_time - start_time
    for idx in range(start_idx, min(end_idx, TOTAL_SAMPLES)):
        t = (idx - start_idx) / SAMPLE_RATE
        progress = t / dur
        # Sweeping saw/sine frequency from 110Hz to 880Hz
        freq = 110.0 * math.pow(8.0, progress)
        env = math.pow(progress, 2.2) * strength
        val = math.sin(2.0 * math.pi * freq * t) * env
        # Stereo panning from left to right
        left_channel[idx] += val * (1.0 - progress * 0.5)
        right_channel[idx] += val * (0.5 + progress * 0.5)

# 1. Add Kicks on every beat (every 0.5s from 0.0 to 14.5s)
for b in range(30):
    t_beat = b * BEAT_DUR
    add_kick(t_beat, strength=0.85 if b % 4 == 0 else 0.65)

# 2. Add Scene Change Hits at major transitions
scene_cuts = [0.0, 2.0, 4.0, 6.0, 8.0, 12.0]
for cut in scene_cuts:
    add_hit(cut, strength=0.75)

# 3. Add Sub-Bass Riser leading into the strongest moment (from 6.5s to 8.0s, and 10.5s to 12.0s)
add_riser(6.0, 8.0, strength=0.6)
add_riser(10.0, 12.0, strength=0.7)

# Normalize and convert to 16-bit PCM WAV
max_val = max(max(abs(x) for x in left_channel), max(abs(x) for x in right_channel), 0.001)
scale = 32767.0 * 0.92 / max_val

wav_file = wave.open('/home/ilhammu29/academic-agent-studio/scripts/render_showreel/soundtrack.wav', 'wb')
wav_file.setnchannels(2)
wav_file.setsampwidth(2)
wav_file.setframerate(SAMPLE_RATE)

frames = bytearray()
for i in range(TOTAL_SAMPLES):
    l_sample = int(max(-32768, min(32767, left_channel[i] * scale)))
    r_sample = int(max(-32768, min(32767, right_channel[i] * scale)))
    frames.extend(struct.pack('<hh', l_sample, r_sample))

wav_file.writeframes(frames)
wav_file.close()
print("Successfully generated soundtrack.wav (15.000s, 44.1kHz, 16-bit stereo)")
