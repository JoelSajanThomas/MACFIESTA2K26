import { LOADING_MESSAGES } from "../../theme/roster";

/** Lightweight themed loader — does not artificially delay. */
export default function MultiverseLoading({ message }) {
  const text = message || LOADING_MESSAGES[0];
  return (
    <div className="multiverse-loading" role="status" aria-live="polite">
      <div className="multiverse-loading__portal" aria-hidden="true" />
      <p className="multiverse-loading__title">Opening the Multiverse</p>
      <p className="multiverse-loading__msg">{text}</p>
    </div>
  );
}
