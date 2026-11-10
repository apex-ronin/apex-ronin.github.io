/* Deploy-time configuration. Nothing secret lives here. */
window.APEX_CONFIG = {
  /* Set to a Formspree/Basin/self-hosted endpoint accepting POST application/json
     to enable real server delivery. Leave "" to use the zero-backend fallback:
     a pre-filled mail client draft + downloadable JSON payload. */
  formEndpoint: "",
  contactEmail: "intake@apexronin.com",
  calendlyUrl: "", // optional; when set, a scheduling link replaces the mailto CTA
};
