# FreshCast intro: one take, the transformation done by Higgsfield (about 10s)

## What happens on screen
```
0.0–3.4s  CHEF, in a busy kitchen. Holds a steel pan heaped with fresh food and tips it into a bin.
          "Every night, we threw this out."
3.4–4.4s  TRANSFORMATION. You brush your hand down your chest. The chef jacket breaks into glowing
          green-white particles that drift up and away; a navy overshirt pops on. The kitchen
          dissolves into a quiet dining room at the same moment.
4.4–10s   OWNER, in a dining room after close.
          "And I had no idea what it cost me… So I fixed it."  Turns the laptop to camera. Hold.
10s →     The laptop screen shows the FreshCast green frame. Join it to your deck recording with one
          dissolve (iMovie, free). The deck opens on that same frame.
```

**Know this before you spend a generation:** Genjutsu is built to keep your motion and timing and to change how things look. Its documentation doesn't show a feature for changing outfits partway through a clip. So the prompt below asks for it with an exact timeline, and your body gives it a clear trigger (the hand brushing down your chest) to attach the effect to. Generation 1 will show whether it follows a mid-clip change. If it doesn't, the "Generation 2" section says what to do.

---

## 1. What you wear and hold (what you actually have)
- **Clothes:** any **plain, fitted, solid-color t-shirt**, dark is best. No logos, no hoodie strings, no jacket. A clean silhouette gives Genjutsu something to map both outfits onto.
- **Object in your hands:** any **flat, wide box**, like a shoebox lid or a package. Hold it open side up. Genjutsu turns it into the food pan (reference 5).
- **Laptop:** on the table to your right, open, brightness at max. Show `localhost:3000/pitch?cut=video` in full screen (press F) so the green leaf frame is on screen.

## 2. Camera
- Phone in **landscape**, 1x lens, **1080p, 30fps**. Prop it on books or a cup at **your eye level**, about **1 metre away**, pointing straight at you.
- Frame from your **waist up**, with the table edge along the bottom and the laptop inside the frame on the right.
- **Background:** a dining hall or café, ideally with people moving behind you. If you can't, a plain wall also works, because Genjutsu replaces the background.
- **Light:** face a window or lamp, with no bright window behind you.
- **Lock focus and exposure:** long-press on your face until AE/AF LOCK appears. Don't touch the phone after you hit record.

## 3. What your body does (one take; record 4–5 and keep the best)
| Time | Body | Say |
|---|---|---|
| 0.0–0.5s | Sit tall with the box flat at chest height in both hands. Look down at it. | — |
| 0.5–2.8s | Slowly tip the box forward and down toward the bottom-right, as if dumping it into a bin. Shake your head, then look at the lens. | "Every night, we threw this out." |
| 2.8–3.4s | Lower the box straight down below the table, out of frame. Sit up. | — |
| **3.4–4.4s** | **The trigger.** Put your right hand flat on your left shoulder, then brush it firmly down and across your chest to your right hip, about 0.8s. As you finish, lift your chin and square your shoulders. | — |
| 4.4–7.5s | Look straight at the lens, slight lean in. | "And I had no idea what it cost me." |
| 7.5–10s | Rotate the laptop to face the camera, slide it about 10cm toward the phone, small smile. **Hold completely still for the last 1.5s.** | "So I fixed it." |

Trim to the cleanest 10 seconds. Keep the original file: it has your audio.

---

## 4. Reference images (10 slots; upload in this exact order)
Use [Pexels](https://www.pexels.com/license/) or Unsplash, which are free for commercial use. Pick images that are clear, well lit, and show one thing each.

| # | Role | What to find | Search terms |
|---|---|---|---|
| 1 | **Face** | Your face, front, soft light, neutral expression | your selfie |
| 2 | **Face** | Your face, three-quarter turn, same light | your selfie |
| 3 | **Outfit A** | White double-breasted chef jacket on a person, plain background, no hat | "chef jacket white" |
| 4 | **Outfit B** | Navy overshirt or casual navy blazer over a white tee, on a person | "navy overshirt men", "navy blazer white t-shirt" |
| 5 | **Prop** | Stainless steel pan heaped with fresh pasta and bread, at about a 45° angle | "hotel pan pasta", "catering tray food" |
| 6 | **Prop** | Restaurant bin with discarded bread and pasta | "food waste restaurant bin" |
| 7 | **Scene A** | Busy commercial kitchen, straight-on at eye level, steel counters, steam, warm light | "restaurant kitchen line cooks" |
| 8 | **Scene B** | Empty restaurant dining room at night, chairs on tables, one warm pendant light | "empty restaurant night", "chairs on tables restaurant" |
| 9 | **Prop** | The FreshCast laptop frame | `_reference/higgsfield/laptop-screen-brand.png` |
| 10 | **Effect look** | Glowing particles dispersing upward (a dissolve or embers look, green-white) | "glowing particles dark background", "dust particles light" |

---

## 5. Generation 1 prompt (1080p)

> Keep the original camera framing, body motion, lip movement, speech and timing exactly as filmed. The man's face, hair and build match Image 1 and Image 2 in every frame.
>
> 0.0 to 3.4 seconds: he wears the white double-breasted chef jacket from Image 3. The background is the busy restaurant kitchen from Image 7: stainless steel counters, a ticket rail, rising steam, warm tungsten light, two cooks moving in soft focus behind him. The box in his hands is the stainless steel pan from Image 5, heaped with fresh, untouched pasta and bread. When he tips it, the food slides toward the steel bin from Image 6 just below the frame.
>
> 3.4 to 4.4 seconds, the transformation: as his right hand brushes down across his chest, the chef jacket breaks apart into thousands of small glowing green-white particles like Image 10. They follow the path of his hand and drift upward and away. In the same motion the navy overshirt from Image 4 materializes on him from the shoulders down, crisp and fitted. At the same moment the kitchen dissolves into particles and the empty dining room from Image 8 forms behind him.
>
> 4.4 to 10 seconds: he wears the navy overshirt from Image 4 in the empty dining room from Image 8: chairs on tables, one warm pendant light, soft focus, calm after-hours mood. The laptop on the table shows Image 9: a dark screen with a green leaf logo, sharp and bright, held steady in the final 1.5 seconds.
>
> Realistic, filmed-on-a-phone look, shallow depth of field, natural skin texture, slight film grain. The particles are the only visual effect. No text, no captions, no logos, no extra people in front of him.

### Check generation 1 before using generation 2
- [ ] Your face in every frame, including during the head shake and the brush
- [ ] Chef jacket and kitchen before 3.4s
- [ ] The particle change happens with the brush, not at a random moment
- [ ] Overshirt and dining room after 4.4s, with no flicker back to chef
- [ ] The box reads as a pan of food in the first 3 seconds
- [ ] The laptop screen is steady and dark-with-green at the end

---

## 6. Generation 2: fix only what failed
| What generation 1 did | Generation 2 change |
|---|---|
| **Perfect except small issues** (face drift, glossy look) | Same prompt. Use a sharper front selfie for Image 1 and add "Do not change his face." For glossiness, add "imperfect handheld phone video, practical light only." |
| **Transformation at the wrong moment** | Change "3.4 to 4.4 seconds" to match the second your hand actually starts moving in your source, and add: "The change happens only while his hand moves across his chest, never before." |
| **Effect too weak** (a fade, not particles) | Replace the transformation paragraph's first sentence with: "the chef jacket shatters into a dense burst of glowing green particles that scatter outward and upward, fully revealing the navy overshirt underneath within half a second." |
| **One look for the whole clip** (no mid-clip change) | The tool won't do a timed change on this clip. Use generation 2 for the other look: if generation 1 came back all-chef, generate all-owner with the 4.4–10s paragraph only, and vice versa. Join them at the brush moment in iMovie with a 0.5s cross dissolve. Same motion means the hand lines up. |
| **Background didn't change** | Remove both background sentences and keep only the outfit and pan changes, so the effect happens on you, in your real room. |

---

## 7. Fading into the deck
1. Record the deck with your webcam in OBS: `localhost:3000/pitch?cut=video&cam=1`, press F. It opens on the same green leaf frame that's on the laptop.
2. In **iMovie**, place the Higgsfield clip, then the deck recording, and add a **Cross Dissolve** of about 0.5s between them. If Genjutsu dropped the sound, add your original take's audio under the Higgsfield clip.
3. Your first line once the deck appears: "Hey, I'm Daniel. And that bin? It's not just a money problem." Then continue the main script from slide 2.
