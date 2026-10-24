# FreshCast intro v2 (about 9 seconds)

## Why v1 looked fake, and the fix
- **A seated chef looks wrong.** Line cooks stand at a counter. v2: you **stand** for the whole take, hands on a counter-height surface at your waist. That works in both scenes: a steel prep counter in the kitchen, then the bar or host counter in the dining room.
- **The backgrounds didn't match the camera.** Stock photos are shot from a different height, lens and distance, so you looked pasted on. v2: generate both backgrounds as "plates" from the same camera spot as your phone: chest height, 1 metre from you, phone wide lens, focused on where you'll stand, so the background is already blurred the right amount.
- **The light didn't match.** Note which side your real light comes from (window or lamp) and use the same side in both prompts. Below, it's from **camera left**. Change both prompts if yours is on the right.
- **No laptop.** It looked staged. v2 ends on "So I fixed it, with FreshCast." and the logo is added in editing, not generated (AI warps logos and text).

---

## 1. Image prompts (generate these first, 16:9, highest resolution)

Use the same image model for both so grain and color match. Generate 4 of each and pick the pair that looks most like the same building.

### Image A: kitchen plate (Scene 1)
> Photorealistic background plate for a video, 16:9, shot on a phone main camera (26mm equivalent, f/1.8) from chest height, about 1.4 metres off the floor, camera level, looking straight ahead. In the foreground a brushed stainless steel prep counter runs the full width of the frame along the bottom edge, at waist height, empty except for a folded white towel at the far right, slightly out of focus. There is no person in the centre of the frame: the space directly behind the counter, where someone would stand, is empty floor 1 metre from the camera. Behind that, 3 to 6 metres away and strongly out of focus: a busy small restaurant kitchen during dinner service, a steel shelf with stacked hotel pans, a ticket rail with paper order slips, steam rising off pots on a gas range, two line cooks in white jackets moving, with slight motion blur. Warm tungsten practical light from overhead, the key light coming from camera left, slightly cooler fill from the right. Natural noise like a phone video frame, no stylization. Realistic clutter, worn surfaces, small independent restaurant, not a showroom. No text, no signs, no logos, no brand names.

### Image B: dining room plate (Scene 2)
> Photorealistic background plate for a video, 16:9, same camera as before: phone main camera (26mm equivalent, f/1.8) from chest height, about 1.4 metres off the floor, level, looking straight ahead. In the foreground a dark wooden bar counter runs the full width of the frame along the bottom edge, at waist height, empty except for a small closed notebook and a pen at the right edge, slightly out of focus. The space directly behind the counter, 1 metre from the camera, is empty. Behind that, 3 to 7 metres away and out of focus: the same small independent restaurant after closing time, an empty dining room, wooden chairs turned upside down on the tables, one warm pendant light glowing above the tables slightly to camera left, dark street windows reflecting the warm light, a quiet late-night mood. Key light from camera left, warm, low intensity, the rest of the room falling into shadow. Natural phone-video noise, no stylization, lived-in and slightly worn. No people, no text, no signs, no logos, no brand names.

### Image C (optional): the pan, held correctly
Only if the pan still looks off. Shoot your real prop instead if you can; a real object beats a generated one.
> Photorealistic product photo, 3/4 view from slightly above, a full-size stainless steel hotel pan (about 50 by 30 cm) heaped with fresh untouched food: penne pasta in tomato sauce, torn focaccia, a handful of arugula. Clean dark background, soft studio light from the left, sharp focus, realistic steel reflections. No hands, no text, no logos.

**Check before you use them:** the counter edge sits low in frame (bottom 15–20%), nothing stands where you'll be, the background is blurred like a phone shot (not razor sharp, not smeared), and the light comes from the same side in A and B.

---

## 2. Filming, plain version (solo, camera never moves)
- The camera stays still the whole time. Prop the phone at chest height (books on a shelf or table), press record, walk into place, wait 2 seconds, act, then walk back and stop. Trim the start and end in editing.
- Hold a real baking tray or sheet pan (anything flat with a rim). The generator turns it into the steel pan full of food. If you only have a box lid, that works too.
- "Tipping" = pretending to dump the tray's food into a bin below the counter.

## 2b. Filming detail (one take, standing, about 9 seconds)
- **Camera:** phone in landscape, 1x, 1080p 30fps, at **your chest height**, 1 metre away, level. Long-press your face for AE/AF LOCK.
- **You:** standing behind a table or counter at waist height (a kitchen counter at home works). Plain dark fitted t-shirt. Light from **camera left** (window or lamp), nothing bright behind you.
- **Prop:** a flat box held in **both hands**, tipped toward **your right hand** (camera left), so the food falls out of frame on that side. Keep both hands on it the whole time so the generator can't swap which hand holds it.

| Time | Body | Say |
|---|---|---|
| 0.0–0.4 | Holding the box flat at chest height in both hands, looking down at it. | — |
| 0.4–2.8 | Tip it slowly toward your right hand and down, as if into a bin below the counter. Small head shake, look at the lens. | "Every night, we threw this out." |
| 2.8–3.4 | Lower the box below the counter, out of frame. Stand tall. | — |
| 3.4–4.4 | **Trigger:** right hand flat on left shoulder, brush down and across your chest to the right hip (0.8s). Lift your chin. | — |
| 4.4–6.6 | Both hands resting on the counter, lean in slightly, look at the lens. | "And I had no idea what it cost me." |
| 6.6–8.8 | Small nod, slight smile on the last word. **Then hold still for 1 second.** | "So I fixed it, with FreshCast." |

Do 4–5 takes, keep the cleanest one, trim to about 9 seconds. Keep the original file for the audio.

---

## 3. Genjutsu prompt (video-to-video, 1080p)

**Upload order (must match):** 1. White chef jacket · 2. Navy overshirt · 3. Steel pan (Image C, or your old pan image) · 4. **Image A** (kitchen plate) · 5. **Image B** (dining plate) · 6. Glowing particles reference.

> PRESERVE: Keep the original camera position, framing, lens, body motion, both hands, head turns, lip movement, speech and timing exactly as filmed, frame for frame. Keep the man's own face, hair, skin tone and build from the source video in every frame. One continuous shot, no cuts, no added camera movement. He is standing behind a waist-height counter for the whole shot.
>
> PART 1 (0.0 to 3.4 seconds): He wears the white double-breasted chef jacket from Image 1, buttoned, fitted, sleeves rolled once. The background is exactly Image 4, with the camera, perspective and blur of Image 4; the steel counter in Image 4 is the surface in front of him, with its edge where his hands are. The cooks in the background keep moving with slight motion blur and the steam keeps rising. The box he holds in both hands is the stainless steel pan from Image 3, heaped with fresh food. When he tips it toward his right hand, the food slides off that edge and falls below the counter, out of frame. Both of his hands stay on the pan the whole time.
>
> PART 2, TRANSFORMATION (3.4 to 4.4 seconds): As his right hand brushes down across his chest, the chef jacket breaks into thousands of tiny glowing particles, white with an emerald green glow, following his hand and drifting upward out of frame. Right behind that wave the navy overshirt from Image 2 appears from the shoulders down, open over a plain dark t-shirt. At the same moment the kitchen behind him dissolves into the same particles from the edges inward and Image 5 forms in its place; the steel counter becomes the dark wooden bar counter of Image 5. One smooth wave, about one second. His face does not change. No flash, no full-frame blur.
>
> PART 3 (4.4 seconds to the end): He wears the navy overshirt from Image 2 in the dining room of Image 5, with Image 5's camera, perspective and blur, his hands resting on its wooden counter. No flicker back to the chef jacket, no leftover particles after 4.6 seconds. The pendant light stays steady. The final second is completely still.
>
> LIGHT: Photorealistic, like a modern phone video. The light on his face comes from camera left in both scenes, matching Image 4 and Image 5: warm tungsten in the kitchen, a dimmer warm pendant in the dining room. His edges blend into the background naturally, with soft light wrap and matching grain, never a cut-out outline. The particles are the only effect and cast a soft green light on him while they're visible.
>
> AVOID: No text, captions, watermarks or logos. No laptop or screen. No people in front of him or near him. No change to his face, hair or body. No extra fingers, no swapping which hand holds the pan. No camera shake, zoom or cuts. No change outside 3.4 to 4.4 seconds.

---

## 4. Editing (iMovie or CapCut, free)
1. Clip: the generated video, about 9 s, with **your original audio** (detach audio from the source take and lay it under the generated clip so the lips match).
2. At "...with FreshCast": place `laptop-screen-brand.png` (or the logo from `/pitch?cut=video`, first frame) as an overlay. Fade it in over 0.4 s, centered, on a dark scrim at 60% so it reads.
3. Hold the logo 1 s, then a 0.5 s cross-dissolve into your pitch recording.
4. No music, or royalty-free music you have rights to. No brand names on screen except FreshCast and Kiro.
