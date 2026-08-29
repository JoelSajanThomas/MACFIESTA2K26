import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface NextLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string | { pathname?: string; query?: Record<string, any> };
  to?: string;
  children?: React.ReactNode;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  legacyBehavior?: boolean;
  passHref?: boolean;
  shallow?: boolean;
  locale?: string | false;
  as?: string;
  className?: string;
  [key: string]: any;
}

export default function Link({
  href,
  to,
  children,
  replace,
  scroll,
  prefetch,
  legacyBehavior,
  passHref,
  shallow,
  locale,
  as,
  ...props
}: NextLinkProps) {
  const target = (typeof href === 'string' ? href : href?.pathname) || to || '#';
  const isExternal =
    typeof target === 'string' &&
    (target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:'));

  if (isExternal) {
    return (
      <a href={target} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={target} replace={replace} {...props}>
      {children}
    </RouterLink>
  );
}

export { Link };
