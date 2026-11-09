# Neuromap on Google Play: complete submission kit

Everything needed to publish **Neuromap by Lumifya** in Google Play Console. Every image and the video in this folder were generated in code from the real app (see `marketing/`), so they can be regenerated after any update.

| | |
|---|---|
| App name | **Neuromap: 3D Nervous System** |
| Package name | `com.lumifya.neuromap` (permanent once uploaded) |
| Developer name | Lumifya |
| Category | Education |
| Price | Free · no ads · no in-app purchases |
| Target API | 36 (Android 16), as Play requires for new apps since 31 Aug 2026 · minimum Android 8.0 (API 26) |
| Upload file | `Neuromap.aab` from the latest GitHub Release (see "Signing" below first) |

## 1. Files in this folder

| Play Console field | File | Spec Play requires |
|---|---|---|
| App icon | `graphics/icon-512.png` | 512 × 512 PNG, ≤ 1 MB |
| Feature graphic | `graphics/feature-graphic-1024x500.png` | 1024 × 500, PNG/JPEG without alpha |
| Phone screenshots (choose 4–8) | `graphics/phone-marketing/*.png` (with headlines) or `graphics/phone/*.png` (plain app) | 1080 × 1920, 9:16 |
| 7-inch and 10-inch tablet screenshots | `graphics/tablet/*.png` | 2560 × 1600, 16:10 |
| Promo video | `video/neuromap-promo-1080p.mp4` → upload to YouTube, paste the link | YouTube URL; public or unlisted, embeddable, ads off |
| Listing text | `listing/en-US.md`, `listing/hi-IN.md`, `listing/ur.md` | name ≤ 30, short ≤ 80, full ≤ 4000 characters (all checked) |
| Privacy policy | `../privacy.html` | public URL (see section 3) |

## 2. Before the first upload: signing (do this once)

Google Play App Signing is mandatory for new apps. You upload an AAB signed with your private **upload key**, and Google re-signs it for users.

The repository contains a *public* sideload key so that anyone can build an installable APK. **Do not use that key as your Play upload key.** Create your own key and keep it safe:

```bash
keytool -genkeypair -v -keystore lumifya-upload.jks -alias lumifya-upload \
  -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 lumifya-upload.jks > lumifya-upload.jks.b64     # macOS: base64 -i lumifya-upload.jks
```

In GitHub, open **Settings → Secrets and variables → Actions** and add these four repository secrets:

| Secret | Value |
|---|---|
| `NEUROMAP_UPLOAD_KEYSTORE_BASE64` | contents of `lumifya-upload.jks.b64` |
| `NEUROMAP_KEYSTORE_PASSWORD` | keystore password |
| `NEUROMAP_KEY_ALIAS` | `lumifya-upload` |
| `NEUROMAP_KEY_PASSWORD` | key password |

Then run the **Build Android APK** workflow (Actions → Run workflow). The new `Neuromap.aab` in the release is now signed with your private key. Back up `lumifya-upload.jks` and its passwords; if you lose them you can request an upload-key reset from Google, but it takes time.

## 3. Privacy policy URL

Use either of these:

- **Recommended:** turn on GitHub Pages (Settings → Pages → Source: *GitHub Actions*). The policy is then at `https://qureshi313737.github.io/Nervsyst/privacy.html`.
- **Or** the GitHub file page: `https://github.com/Qureshi313737/Nervsyst/blob/main/privacy.html`. This works only while the repository is public.

## 4. Create the app

Play Console → **Create app**:
- App name: `Neuromap: 3D Nervous System`
- Default language: English (United States), en-US
- App or game: **App**
- Free or paid: **Free** (a free app cannot later be made paid)
- Accept the declarations.

## 5. Main store listing (Grow → Store presence → Main store listing)

Copy the text from `listing/en-US.md`. Add translations under **Manage translations** with `listing/hi-IN.md` (Hindi, hi-IN) and `listing/ur.md` (Urdu, ur). Upload the graphics from section 1 and paste the YouTube link of the promo video.

**Store settings:**
- Category: **Education**
- Tags (pick up to 5 that Console offers): Education, Science, Biology, Medical, Reference
- Contact email: your Lumifya support email (required, shown publicly)
- Website: the GitHub Pages URL (optional)

## 6. App content (Policy → App content): answers

| Section | Answer |
|---|---|
| Privacy policy | URL from section 3 |
| App access | **All functionality is available without special access** (no login) |
| Ads | **No, my app does not contain ads** |
| Content rating | Start the IARC questionnaire. Email: yours. Category: **Reference, News, or Educational**. Answer **No** to violence, fear, sexuality, nudity, profanity, drugs, alcohol, tobacco, gambling and crude humour. Answer **No** to "users can interact or exchange content", "shares user location" and "digital purchases". Expected result: Everyone / PEGI 3 / IARC 3+. |
| Target audience and content | Age groups: **13–15, 16–17, 18 and over**. Choosing under-13 would bring in Families Policy requirements. "Could your store listing unintentionally appeal to children?" **No.** |
| News app | **No** |
| Data safety | "Does your app collect or share any of the required user data types?" **No.** That is all; there is no data to describe. (The app has no accounts, analytics, ads or network access; settings stay in local storage on the device.) |
| Government app | **No** |
| Financial features | **None** |
| Health apps (if Console asks) | Choose the education/reference option that fits best. Neuromap is not a medical device and gives no diagnosis or treatment advice. |
| Advertising ID | Not used (the app declares no AD_ID permission) |

## 7. Releases

1. **Testing → Internal testing → Create release**: upload `Neuromap.aab`, paste the release notes from the listing file, add your own email as a tester and install it from the opt-in link. This is the fastest way to see the real build on your phone.
2. **Personal developer accounts created after 13 Nov 2023:** Google requires a **closed test with at least 12 testers opted in for at least 14 days in a row** before you can apply for production access. Create a closed testing track, invite 12 or more people (a Google Group email works), keep it running for 14 days, then apply for production. **Organisation accounts** (for example registered as the company Lumifya, which needs a D-U-N-S number) do not have this requirement.
3. **Production → Create release** → upload the same or a newer AAB → choose countries (all) → **Send for review**. Review usually takes from a few days up to about a week for a new app.

Each push to `main` builds a new APK and AAB with a higher version code, ready for the next release.

## 8. Regenerating the graphics and video

```bash
npm ci
npm i --no-save playwright && npx playwright install chromium
node marketing/store-assets.cjs          # icon, feature graphic, phone + tablet + marketing screenshots
FPS=24 node marketing/promo-video.cjs    # store/video/neuromap-promo-1080p.mp4 (needs ffmpeg + python3/numpy)
```

Rendering uses software WebGL, so it works on any machine. Add `GPU=1` on a machine with a GPU to make it much faster.
