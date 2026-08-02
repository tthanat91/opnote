/* =====================================================================
   config.js — the one file you edit before publishing.

   Paste your Apps Script web app URL below. Everyone who opens the link
   then gets a working app with nothing to set up: no URL to paste, no
   per-device configuration.

   IMPORTANT — this URL becomes readable by anyone who views the page
   source. That is unavoidable for a static site, and it is why the
   registry is protected by a passcode instead. Set the passcode in the
   Config tab of your Google Sheet (Operative Note ▸ Set team passcode).
   Without the passcode the script refuses to read or write anything.

   Users can still override the URL on their own device from the
   Settings screen — useful if you ever run a second, test Sheet.
   ===================================================================== */

window.OPNOTE_CONFIG = {

  /* Ends with /exec — from Deploy ▸ Manage deployments */
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxLJUtruIkUmVUyerwdtwQNO6EbUDPzsbLkOWSKn_sW-oyrcCsTgr5oUDPFFVeWXs9m/exec',

  /* true  = ask for the access key as soon as the page opens (recommended)
     false = let anyone fill in and print, and only ask when they save    */
  requireLogin: true,

  /* Shown on the sign-in dialog so colleagues know who to ask */
  contact: 'ติดต่อ อ.ธนัท / contact Dr Thanat for the passcode'

};
