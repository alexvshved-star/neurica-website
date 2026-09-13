// Single source for the ALTACO phone shown in PDF documents. Owner-approved
// number (2026-09-13) — both PDF generators import from here so it cannot
// drift again. Website/email stay as they were; not centralised here.
export const ALTACO_PHONE = '+38 097 242 21 21';
export const ALTACO_PHONE_TEL = '+380972422121';
export const ALTACO_WEBSITE = 'ALTACO.COM.UA';
export const altacoContactLine = () => `${ALTACO_PHONE} / ${ALTACO_WEBSITE}`;
