# StudyConnect brand assets

The user supplied the StudyConnect symbol, wordmark reference, and a six-second motion-logo video. These assets use that original video artwork; the symbol has not been redrawn.

- `studyconnect-mark.webp`: static, fully formed mark extracted at 1.5 seconds from the supplied video.
- `studyconnect-motion-poster.webp`: the same frame with the motion crop for a stable poster/fallback.
- `studyconnect-motion.mp4`: the supplied animation, cropped around its artwork, resized to 256px, muted, and trimmed to a 4.8-second one-time playback. The unused portrait background is removed. No looping.
- `favicon.png`: small static version of the supplied mark.
- `apple-touch-icon.png`: 180px static icon for mobile bookmarks.

The React `Brand` component pairs the symbol with a bold “Study” and regular “Connect” wordmark based on the supplied lockup. Navigation, mobile navigation, startup/error screens, and account access use the same component. The original degree-cap and diamond brand placeholders are replaced; learning icons elsewhere remain UI icons.

Only account access uses motion. Reduced-motion and data-saver preferences use a static poster without requesting a video. The motion also falls back to the poster if autoplay/playback fails. Playback pauses offscreen or when the page is hidden. The animation runs for less than five seconds and can be replayed using a labeled, keyboard-accessible button. Decorative media is hidden from assistive technology; the visible wordmark supplies the brand name.
