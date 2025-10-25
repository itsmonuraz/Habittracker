// Export generateStaticParams for static site generation
export function generateStaticParams() {
  return [
    { username: 'camino' },
    { username: 'jordan' },
    { username: 'ti' }
  ];
}

// Disable dynamic params - users should be accessed via hash routing (e.g., /#username)

export const dynamicParams = false;

export default function UsernameLayout({ children }) {
  return children;
}
