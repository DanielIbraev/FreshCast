# FreshCast intro: one shot, one swipe, ~10 seconds

## The idea
You film **one continuous take**, seated, wearing the **owner** outfit. Genjutsu Lite makes a **chef** version of that exact clip: white chef jacket, restaurant kitchen behind you, and your box turned into a steel pan of untouched food. Genjutsu keeps motion, framing, and timing as filmed, so the two clips line up frame for frame. In CapCut you stack them, and your hand sweeping across the lens wipes from chef to owner. Then the laptop zooms into the deck.

```
0.0 ─ 3.5s   CHEF (Genjutsu)   holds a pan of food, tips it into the bin   "Every night, we threw this out."
3.5 ─ 4.3s   HAND SWIPE        jacket, kitchen and food wipe away behind your hand
4.3 ─ 10s    OWNER (real)      "And I had no idea what it cost me… So I fixed it."  laptop turns to camera
10s →        ZOOM INTO LAPTOP  dissolve into the deck's green brand frame, webcam bubble fades in
```

---

## 1. What you need
- **Box:** a shallow open cardboard box or a shoebox lid, about 30×20cm and 5–8cm deep. Shallow and wide reads as a kitchen pan. A baking tray is even better. A folded shirt is a weak choice because it has no rigid shape for the AI to map onto.
- **Owner outfit (what you actually wear):** a dark overshirt or button-up over a plain tee. Avoid logos and busy patterns.
- **Laptop:** open on the table to your right, screen brightness at max, showing `localhost:3000/pitch?cut=video` in full screen (press F). That's the green-logo frame the deck opens on.
- **Phone:** landscape, 1x lens, 1080p, 30fps. Propped on books or a cup.

## 2. Camera setup
- **Place:** a table in a busy dining hall or café, with people moving behind you. Real busyness helps even if the background swap only partly works.
- **Distance:** about 1–1.2m. Frame from your waist up, with the table edge visible along the bottom and the laptop inside the frame on the right.
- **Height:** phone lens at your eye level, pointed straight at you, not tilted.
- **Light:** face a window or bright light. Keep any bright window out of the background.
- **Lock focus and exposure:** long-press on your face until AE/AF LOCK shows.
- **Audio:** the phone mic is fine. Speak about 20% louder than normal because of the busy room.
- Don't touch the phone once recording starts. Start recording, sit, wait 1 second, begin.

## 3. Exactly what to do (one take; do 4–5 and keep the best)
| Time | Body | Say |
|---|---|---|
| 0.0–0.5s | Sitting tall, box held flat at chest height with both hands, open side tilted slightly toward the camera. Look down at it. | — |
| 0.5–3.0s | Slowly tip the box forward and down toward the bottom-right, as if dumping it into a bin just below the frame. Shake your head, then look at the lens. | "Every night, we threw this out." |
| 3.0–3.5s | Lower the box straight down below the table edge, fully out of frame. | — |
| 3.5–4.3s | **The swipe.** Right hand flat, palm toward the lens, about 20cm from the phone. Sweep left to right across the whole frame in about 0.6s. Moderate speed: fast enough to feel snappy, slow enough that your hand isn't a blur. | — |
| 4.3–7.5s | Look straight at the lens, slight lean in. | "And I had no idea what it cost me." |
| 7.5–10s | Rotate the laptop to face the camera, slide it about 10cm toward the phone, small smile. **Hold completely still for the last 1.5s.** | "So I fixed it." |

Trim to the cleanest 10 seconds and export as MP4, 1080p. This is your **source video**. Keep the original file: its audio goes back in at the end.

---

## 4. Reference images

### Generation 1 (chef): 6 images, upload in this order
| # | What to find | Search terms (Pexels / Unsplash, free) | Must look like |
|---|---|---|---|
| 1 | Your face, front | selfie | Soft light, no glasses glare, neutral face |
| 2 | Your face, three-quarter | selfie | Same light as #1 |
| 3 | White double-breasted chef jacket, on a person or flat-lay | "chef jacket white" | Plain white, black or white buttons, no hat, no logo |
| 4 | Stainless steel pan full of untouched food | "hotel pan pasta", "catering tray food" | Shot from a ~45° angle, food heaped and fresh |
| 5 | Commercial kitchen bin with discarded food | "food waste restaurant bin" | Steel or grey bin, visible bread and pasta |
| 6 | Busy restaurant kitchen, straight-on, eye level | "restaurant kitchen line cooks", "commercial kitchen steam" | Stainless counters, warm light, cooks soft in the background, roughly your camera angle |

Fewer, clearer references beat a full set of 10. Each one should have one obvious job.

### Generation 2 (optional owner upgrade): 4 images
| # | What | Search terms |
|---|---|---|
| 1, 2 | Your two face photos again | |
| 3 | Cozy restaurant dining room after closing, chairs on tables, one warm pendant light | "empty restaurant night", "chairs on tables restaurant" |
| 4 | The FreshCast laptop frame | `_reference/higgsfield/laptop-screen-brand.png` |

---

## 5. Prompts

### Generation 1: chef (1080p)
> Keep the original motion, timing, camera framing, lip movement and speech exactly as filmed. Keep the man's face, hair and build from Image 1 and Image 2 for the whole video.
>
> Change his top to the white double-breasted chef jacket from Image 3, sleeves rolled once, for the whole video.
>
> Replace the cardboard box in his hands with the stainless steel pan from Image 4, heaped with fresh, untouched pasta and bread. When he tips it forward, the food slides out toward a steel bin like Image 5 just below the frame.
>
> Replace the background with the restaurant kitchen from Image 6: stainless steel counters, a ticket rail, steam rising, warm tungsten light, two cooks moving in soft focus behind him. The table in front of him becomes a steel prep counter.
>
> Realistic, filmed-on-a-phone look, shallow depth of field, natural skin texture, slight film grain. No text, no captions, no logos. Do not add people in front of him.

### Review generation 1 before spending generation 2
- [ ] Same face as you, including when you shake your head
- [ ] Chef jacket fits and doesn't flicker
- [ ] The box reads as a pan of food in the first 3 seconds (that's all you'll use of this clip)
- [ ] Kitchen background. If it stayed the café, the wipe still works (chef → owner in the same room).
- [ ] Hand and arm during the swipe aren't melted (only the first half of the swipe shows)

### Generation 2: choose one
- **Generation 1 had a problem:** rerun the chef prompt with one fix:

  | Problem | Fix |
  |---|---|
  | Face drift | Sharper front selfie as Image 1. Add: "Do not change his face." |
  | Box still looks like a box | Use a pan photo shot at your box's exact angle. Add: "It is a steel pan, not a box, in every frame." |
  | Too glossy | Add: "imperfect handheld phone video, practical light only." |

- **Generation 1 was great:** do the owner upgrade so the second half lands in a dining room too:
  > Keep the original motion, timing, camera framing, lip movement and speech exactly as filmed. Keep the man's face from Image 1 and Image 2 and his own dark overshirt. Replace the background with the empty restaurant dining room from Image 3 after closing: chairs on tables, one warm pendant light, soft focus. Replace the box with nothing visible; it stays below the table. The laptop screen shows Image 4: dark with a green leaf logo, sharp and bright, especially in the last 1.5 seconds. Realistic phone-video look. No text or captions.

  If the background doesn't change, use your real footage for the owner half. It's real and it already looks fine.

---

## 6. Edit in CapCut desktop
1. **Main track:** the owner clip (generation 2, or your real source).
2. **Overlay track:** the generation 1 chef clip, starting at 0:00.
   - Set the overlay to 50% opacity to check the two line up, then back to 100%.
   - If the lengths differ by a few frames, nudge the overlay until your hand positions match.
   - Mute the overlay.
3. **Audio:** your original source audio on the main track. If the generated clip has no sound, drop the original file's audio under it. The timing matches.
4. **The swipe wipe:**
   - Select the overlay and add a **Linear** mask rotated to vertical, with feather around 25–35.
   - Keyframe the mask edge so it rides the leading edge of your hand every 2–3 frames as it crosses left to right. The chef disappears behind your hand and the owner is revealed.
   - Invert the mask if the reveal goes the wrong way.
   - Delete the overlay after the swipe ends.
5. **Polish the swipe:**
   - A short whoosh sound effect from CapCut's audio library.
   - A 4–6 frame glow or flash effect at the swipe (Effects → search "flash" or "glow").
   - Optional: slow the 0.6s swipe to 0.75x.
6. **Laptop to deck:**
   - At the last 0.8s, add a Scale keyframe at 100%. At the final frame, set Scale to about 260% with Position centered on the laptop screen. Set easing to Ease in.
   - Add a 0.3s **Dissolve** into your OBS recording of `/pitch?cut=video&cam=1`, which opens on the same green frame.
   - Fade the webcam bubble in over 0.5s.
7. **First line on the deck:** "Hey, I'm Daniel. And that bin? It's not just a money problem." Then continue the main script from slide 2.
