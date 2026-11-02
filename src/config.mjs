// Site-wide settings. Secrets never live here: this file ships to the public build.
export const site = {
  name: 'Apex Ronin',
  url: 'https://apexronin.com',
  email: 'jay@apexronin.com',
  founder: 'Jason “Jay” Nelson',
  github: 'https://github.com/apex-ronin',
};

// Lead endpoint: set LEAD_ENDPOINT at build time (e.g. a GitHub Actions variable) to the
// deployed /worker URL. Empty = forms hand requests to the visitor's email app instead.
export function buildSettings() {
  const leadEndpoint = (process.env.LEAD_ENDPOINT || '').trim();
  if (leadEndpoint && !/^https:\/\/[^\s/]+(\/\S*)?$/.test(leadEndpoint)) {
    throw new Error(`LEAD_ENDPOINT must be an https URL, got: ${leadEndpoint}`);
  }
  return { leadEndpoint, version: process.env.BUILD_VERSION || Date.now().toString(36) };
}
