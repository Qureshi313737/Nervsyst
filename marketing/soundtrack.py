"""Original soundtrack for the Neuromap promo, synthesised from scratch.

python3 soundtrack.py out.wav [duration_seconds]

Layers: evolving ambient pad (A minor → F → C → G), heartbeat sub pulse,
shimmering bell accents on each scene cut, filtered-noise whooshes, a riser
into the end card and a final low hit. Stereo, 48 kHz, 16-bit.
"""
import sys
import wave

import numpy as np

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'soundtrack.wav'
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 39.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def note(f):
    return 440.0 * 2 ** ((f - 69) / 12)


def env(start, length, attack=0.5, release=1.0):
    e = np.zeros(N)
    i0, i1 = int(start * SR), min(N, int((start + length) * SR))
    if i1 <= i0:
        return e
    tt = np.arange(i1 - i0) / SR
    a = np.clip(tt / max(attack, 1e-3), 0, 1)
    r = np.clip((length - tt) / max(release, 1e-3), 0, 1)
    e[i0:i1] = np.minimum(a, r) ** 1.5
    return e


def lowpass(x, cutoff):
    alpha = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - alpha) * x[i] + alpha * acc
        y[i] = acc
    return y


def reverb(x, taps=((0.031, 0.5), (0.047, 0.42), (0.071, 0.33), (0.113, 0.26), (0.167, 0.2), (0.241, 0.14))):
    y = x.copy()
    for d, g in taps:
        k = int(d * SR)
        y[k:] += x[:-k] * g
    return y


# ------------------------------------------------------------------ pad
chords = [(0, [57, 60, 64, 69]), (9.75, [53, 57, 60, 65]), (19.5, [48, 55, 60, 64]), (29.25, [55, 59, 62, 67])]
for idx, (start, notes) in enumerate(chords):
    length = 10.6 if idx < 3 else DUR - start
    e = env(start, length, attack=2.2, release=2.4)
    for n in notes:
        f = note(n)
        for det, pan in ((-0.11, 0.25), (0.13, 0.75)):
            ff = f * 2 ** (det / 12)
            tone = (np.sin(2 * np.pi * ff * t) + 0.35 * np.sin(2 * np.pi * 2 * ff * t + 0.3) + 0.12 * np.sin(2 * np.pi * 3 * ff * t))
            tone *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t + n)
            L += tone * e * (1 - pan) * 0.045
            R += tone * e * pan * 0.045
# sub drone
sub = np.sin(2 * np.pi * note(33) * t) * env(1.0, DUR - 1.0, 4.0, 3.0) * 0.12
L += sub
R += sub

# --------------------------------------------------------------- heartbeat
for beat in np.arange(4.2, 35.0, 60 / 66):
    for off, amp in ((0.0, 1.0), (0.24, 0.62)):
        s = beat + off
        i0 = int(s * SR)
        if i0 >= N:
            continue
        k = np.arange(min(N - i0, int(0.35 * SR))) / SR
        thump = np.sin(2 * np.pi * (52 + 30 * np.exp(-k * 30)) * k) * np.exp(-k * 13) * amp * 0.32
        L[i0:i0 + len(k)] += thump
        R[i0:i0 + len(k)] += thump

# ---------------------------------------------- shimmer bells + whooshes on cuts
CUTS = [3.9, 9.0, 13.0, 19.0, 23.5, 27.5, 31.0]
bell_notes = [81, 84, 88, 86, 84, 88, 91]
bl = np.zeros(N)
br = np.zeros(N)
for c, n in zip(CUTS, bell_notes):
    for j, (dn, delay) in enumerate(((0, 0.0), (7, 0.11), (12, 0.23))):
        i0 = int((c + delay) * SR)
        k = np.arange(min(N - i0, int(2.6 * SR))) / SR
        f = note(n + dn)
        b = (np.sin(2 * np.pi * f * k) + 0.3 * np.sin(2 * np.pi * f * 2.76 * k)) * np.exp(-k * 2.4) * 0.05
        (bl if j % 2 == 0 else br)[i0:i0 + len(k)] += b
    # whoosh
    w0 = int((c - 0.7) * SR)
    k = np.arange(int(1.2 * SR)) / SR
    if w0 > 0:
        noise = rng.standard_normal(len(k))
        sweep = lowpass(noise, 1800) * np.sin(np.pi * k / 1.2) ** 2 * 0.09
        L[w0:w0 + len(k)] += sweep * (0.6 + 0.4 * k / 1.2)
        R[w0:w0 + len(k)] += sweep * (1.0 - 0.4 * k / 1.2)
L += reverb(bl) + 0.4 * reverb(br)
R += reverb(br) + 0.4 * reverb(bl)

# ----------------------------------------------------- riser + end-card hit
r0, r1 = 32.8, 35.6
i0, i1 = int(r0 * SR), int(r1 * SR)
k = np.arange(i1 - i0) / SR
riser = lowpass(rng.standard_normal(len(k)), 3000) * (k / (r1 - r0)) ** 2.2 * 0.16
riser += np.sin(2 * np.pi * (220 + 660 * (k / (r1 - r0)) ** 2) * k) * (k / (r1 - r0)) ** 2 * 0.05
L[i0:i1] += riser
R[i0:i1] += riser
h0 = int(35.6 * SR)
k = np.arange(min(N - h0, int(3.4 * SR))) / SR
hit = np.sin(2 * np.pi * (45 + 60 * np.exp(-k * 9)) * k) * np.exp(-k * 1.6) * 0.5
hit += lowpass(rng.standard_normal(len(k)), 900) * np.exp(-k * 6) * 0.25
L[h0:h0 + len(k)] += hit
R[h0:h0 + len(k)] += hit
for dn in (0, 7, 12, 16):
    chime = np.sin(2 * np.pi * note(69 + dn) * k) * np.exp(-k * 1.1) * 0.035
    L[h0:h0 + len(k)] += chime
    R[h0:h0 + len(k)] += chime

# ------------------------------------------------------------- master
fade = np.minimum(np.clip(t / 1.2, 0, 1), np.clip((DUR - t) / 1.8, 0, 1))
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.25) * 0.89
R = np.tanh(R / peak * 1.25) * 0.89
stereo = (np.stack([L, R], axis=1) * 32767).astype('<i2')
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('soundtrack', OUT, f'{DUR:.1f}s')
