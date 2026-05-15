/** Pek demo – prosjektkonfig (erstatter backend i prototype) */
window.PekConfig = {
  id: "wilfa-v3",
  title: "Wilfa Shopify v3",
  owner: "Kristoffer fra TRY Dig",
  publicPath: "feedback.try.no/p/wilfa-v3",

  staging: {
    label: "Staging · Forsiden",
    proxyNote: "I produktet hentes siden via edge-proxy og får injisert Pek-widget.",
    targetHost: "wilfa-staging.tryapps.no",
  },

  figma: {
    label: "Figma · Mobilnavigasjon",
    embedUrl:
      "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fg5i8sDVjrBNMYmK7fkPgRN%2FiOS-18-UI-Kit%3Fnode-id%3D0-1%26t%3DqVqJqJqJqJqJqJqJ-0",
    useEmbed: false,
    frames: [
      { id: "nav-a", label: "Konsept A · Hamburger" },
      { id: "nav-b", label: "Konsept B · Faner" },
      { id: "nav-c", label: "Konsept C · Bottom bar" },
    ],
  },
};
