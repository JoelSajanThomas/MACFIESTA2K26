import { useLocation, useNavigate, useParams as useRouterParams } from 'react-router-dom';

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (path) => navigate(path),
    replace: (path) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function useParams() {
  return useRouterParams();
}

export function useSearchParams() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}
