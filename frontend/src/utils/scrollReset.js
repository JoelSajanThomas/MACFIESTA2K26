/** Synchronous scroll reset — avoids smooth-scroll and overflow-lock races. */
export function resetWindowScroll() {
  const { documentElement: html, body } = document;
  const previousBehavior = html.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  body.classList.remove("nav-menu-open");

  window.scrollTo(0, 0);
  html.scrollTop = 0;
  body.scrollTop = 0;

  html.style.scrollBehavior = previousBehavior;
}
