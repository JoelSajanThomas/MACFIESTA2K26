import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, to, children, ...props }) {
  const target = href || to || '#';
  return (
    <RouterLink to={target} {...props}>
      {children}
    </RouterLink>
  );
}

export { Link };
