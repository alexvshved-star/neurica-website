# ALTACO PDF assets

`offer-assets.json` is loaded only when PDF generation is requested.

- `logo`: raster rendering of the full ALTACO logo from the user-supplied
  `ALTACO_Commercial_Offer_Mystic_Grey_Lot_2025-2.pdf`, page 1,
  rectangle (49, 69, 251, 94) PDF points at 4x. No generated logo.
- `regular` / `bold`: Arimo static instances (400 and 700), subset to Latin,
  Cyrillic and required currency/punctuation glyphs with fontTools.
  Source: https://github.com/google/fonts/tree/main/ofl/arimo
  License: `Arimo-OFL.txt`. Arimo is also embedded in the reference offer.

Material photos use the existing catalogue's attributed source images.
The browser crops the photo to 1400 × 640 JPEG for bounded PDF size.
The same crop and renderer are used by `scripts/catalog/preview-offer.mjs`.
