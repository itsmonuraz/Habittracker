// Export generateStaticParams for static site generation
export function generateStaticParams() {
  return [
    { username: 'camino' }
  ];
}

export default function UsernameLayout({ children }) {
  return children;
}
