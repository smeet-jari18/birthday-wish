# Surprise For You — Vaishnavi Jii ✨

An interactive, full-screen birthday surprise website built with plain HTML, CSS, and JavaScript for Vaishnavi Jii.

## Page-by-page story

1. Opening page is personalized for **Vaishnavi Jii**.
2. Click the button to move to a dedicated devotional blessing page.
3. Ganesh ji, Krishna ji, and Shiva ji images rotate automatically every 2.8 seconds.
4. The blessing title and blessing paragraph change together with each devotional image.
5. Continue to the real flower bouquet photo and click the photo itself.
6. The bouquet gives a small glow, sparkle burst, and pop animation before opening the black-screen Happy Birthday reveal.
7. Continue into the birthday memories page, now featuring the provided Vaishnavi photos and birthday poster in the third card.
8. Continue to the cake page with glowing, breathing cake animation.
9. Open the final sealed blessing letter by clicking or pressing Enter on the letter.

Every step is a separate screen; buttons change the page state instead of making the user scroll through one long page.

## Run it

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173`.

## Personalize it

The default recipient is **Vaishnavi Jii**. The sparkle button in the top-right can still be used to change the name or add a sender name/sign-off. Personalization is saved locally in the browser.

## Included

- Provided real blue flower bouquet photo
- Provided Vaishnavi memory photos
- Ganesh ji, Krishna ji, and Shiva ji devotional images
- Auto-changing devotional carousel with manual controls, dots, and mobile swipe
- Blessing copy that changes with every devotional image
- Clickable bouquet photo with sparkle, glow, pop, and confetti animation
- Black-screen animated Happy Birthday reveal with stars and confetti
- Animated birthday cake with candle interaction
- Click-to-open final blessing letter
- Responsive one-screen-at-a-time navigation
