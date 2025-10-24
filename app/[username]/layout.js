// Export generateStaticParams for static site generation
export function generateStaticParams() {
  return [
    { username: 'camino' },
    { username: 'jordan' },
    { username: 'ti' }
  ];
}

// Disable dynamic params - users should be accessed via hash routing (e.g., /#username)
// This is necessary for GitHub Pages static export
export const dynamicParams = false;

export default function UsernameLayout({ children }) {
  return children;
}
