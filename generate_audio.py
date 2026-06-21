import wave
import struct
import math
import random
import os

# Create directory
out_dir = 'public/assets/audio'
os.makedirs(out_dir, exist_ok=True)

def write_wav(filename, samples, sample_rate=44100):
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        # Convert float samples (-1.0 to 1.0) to 16-bit integers
        int_samples = []
        for s in samples:
            # clip
            s = max(-1.0, min(1.0, s))
            int_samples.append(int(s * 32767.0))
        wav_file.writeframes(struct.pack(f"<{len(int_samples)}h", *int_samples))

sample_rate = 44100

# 1. Generate Ambient Drone (10 seconds)
print("Generating ambient.wav...")
ambient_duration = 10.0
ambient_samples = []
for i in range(int(sample_rate * ambient_duration)):
    t = i / sample_rate
    # Low frequency drone 55Hz + 56Hz for beating effect
    wave1 = math.sin(2 * math.pi * 55 * t)
    wave2 = math.sin(2 * math.pi * 56 * t)
    # Slow volume modulation (LFO)
    lfo = (math.sin(2 * math.pi * 0.1 * t) + 1.0) / 2.0
    val = (wave1 + wave2) * 0.2 * lfo
    ambient_samples.append(val)
write_wav(f"{out_dir}/ambient.wav", ambient_samples)

# 2. Generate Thunder (3 seconds)
print("Generating thunder.wav...")
thunder_duration = 3.0
thunder_samples = []
# low pass filter variables
last_val = 0.0
for i in range(int(sample_rate * thunder_duration)):
    t = i / sample_rate
    # envelope: instant attack, exponential decay
    env = math.exp(-2.5 * t)
    # noise
    noise = random.uniform(-1.0, 1.0)
    # simple low pass to make it rumbly
    val = last_val + 0.1 * (noise - last_val)
    last_val = val
    thunder_samples.append(val * env * 2.0)
write_wav(f"{out_dir}/thunder.wav", thunder_samples)

# 3. Generate Stone dragging (1 second)
print("Generating stone.wav...")
stone_duration = 1.0
stone_samples = []
last_val = 0.0
for i in range(int(sample_rate * stone_duration)):
    t = i / sample_rate
    # envelope: steady then decay
    env = 1.0 if t < 0.8 else math.exp(-15.0 * (t - 0.8))
    # grainy noise
    noise = random.uniform(-1.0, 1.0)
    # low pass filter for low rumble
    val = last_val + 0.05 * (noise - last_val)
    last_val = val
    # add some low frequency modulation for grinding effect
    grind = math.sin(2 * math.pi * 15 * t)
    stone_samples.append(val * env * 1.5 * (grind + 1.0)/2.0)
write_wav(f"{out_dir}/stone.wav", stone_samples)

print("All audio files generated successfully!")
