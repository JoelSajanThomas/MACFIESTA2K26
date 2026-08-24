import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getInstitutions, suggestInstitution } from "../services/api";
import {
  OTHERS_LABEL,
  OTHERS_VALUE,
  filterInstitutions,
  mergeInstitutions,
} from "../data/institutions";

/**
 * Searchable college/school picker with Others → custom name.
 */
export default function CollegeSchoolPicker({
  label = "College / school",
  value = "",
  onChange,
  required = false,
  disabled = false,
  placeholder = "Type to search college or school",
  name = "college_name",
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [options, setOptions] = useState(() => mergeInstitutions());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [isOthers, setIsOthers] = useState(false);
  const [customName, setCustomName] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    getInstitutions()
      .then((res) => {
        if (!mounted) return;
        const remote = res?.data?.institutions || [];
        setOptions(mergeInstitutions(remote));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const current = String(value || "").trim();
    if (!current) {
      if (!isOthers) setQuery("");
      return;
    }
    const inList = options.some((n) => n.toLowerCase() === current.toLowerCase());
    if (inList) {
      setIsOthers(false);
      setQuery(current);
      setCustomName("");
    } else if (current) {
      setIsOthers(true);
      setQuery(OTHERS_LABEL);
      setCustomName(current);
    }
    // Only sync when parent value changes externally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => filterInstitutions(options, query, 12), [options, query]);

  const menuItems = useMemo(() => {
    const items = matches.map((n) => ({ value: n, label: n }));
    const q = query.trim().toLowerCase();
    const exact = options.some((n) => n.toLowerCase() === q);
    if (!exact || !q) {
      items.push({ value: OTHERS_VALUE, label: OTHERS_LABEL });
    }
    return items;
  }, [matches, options, query]);

  function emit(next) {
    onChange?.(String(next || "").trim());
  }

  function selectItem(item) {
    if (item.value === OTHERS_VALUE) {
      setIsOthers(true);
      setQuery(OTHERS_LABEL);
      setCustomName("");
      emit("");
      setOpen(false);
      return;
    }
    setIsOthers(false);
    setCustomName("");
    setQuery(item.label);
    emit(item.label);
    setOpen(false);
  }

  function handleQueryChange(e) {
    const next = e.target.value;
    setQuery(next);
    setIsOthers(false);
    setCustomName("");
    setOpen(true);
    setActiveIndex(0);
    const exact = options.find((n) => n.toLowerCase() === next.trim().toLowerCase());
    emit(exact || "");
  }

  function handleCustomChange(e) {
    const next = e.target.value;
    setCustomName(next);
    emit(next);
  }

  function handleCustomBlur() {
    const cleaned = customName.trim().replace(/\s+/g, " ");
    if (cleaned.length >= 2) {
      setCustomName(cleaned);
      emit(cleaned);
      suggestInstitution(cleaned).catch(() => {});
      setOptions((prev) => mergeInstitutions([...prev, cleaned]));
    }
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, menuItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = menuItems[activeIndex];
      if (item) selectItem(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      <div className="relative w-full">
        {label && (
          <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
            {label}
          </label>
        )}
        <input
          type="text"
          role="combobox"
          name={`${name}_search`}
          value={isOthers ? OTHERS_LABEL : query}
          onChange={handleQueryChange}
          onFocus={() => {
            if (!isOthers) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          disabled={disabled || isOthers}
          placeholder={placeholder}
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          required={required && !isOthers}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-metallic-gold focus:outline-none text-white text-xs font-excon placeholder:text-white/30 transition-colors"
        />

        {open && !isOthers ? (
          <ul
            id={listId}
            className="absolute z-50 top-full left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-white/15 bg-[#0D1020] shadow-2xl backdrop-blur-xl p-1.5 space-y-0.5 text-xs text-white font-excon"
            role="listbox"
          >
            {menuItems.map((item, index) => (
              <li key={item.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    index === activeIndex ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${item.value === OTHERS_VALUE ? "border-t border-white/10 text-metallic-gold font-bold mt-1" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectItem(item)}
                >
                  <span>{item.label}</span>
                  {item.value === OTHERS_VALUE && <span className="text-[10px] uppercase font-mono opacity-80">+ Custom</span>}
                </button>
              </li>
            ))}
            {!matches.length ? (
              <li className="px-3.5 py-2.5 text-white/40 text-xs font-medium">No matches — choose Others below</li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {isOthers ? (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 font-excon-bold">
              Enter custom college / school name *
            </label>
            <button
              type="button"
              className="text-[10px] uppercase font-bold text-metallic-gold hover:underline cursor-pointer font-excon-bold"
              onClick={() => {
                setIsOthers(false);
                setCustomName("");
                setQuery("");
                emit("");
                setOpen(true);
              }}
              disabled={disabled}
            >
              ← Back to list
            </button>
          </div>
          <input
            type="text"
            name={name}
            value={customName}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            disabled={disabled}
            required={required}
            maxLength={200}
            placeholder="Type your college or school name"
            autoComplete="organization"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-metallic-gold focus:outline-none text-white text-xs font-excon placeholder:text-white/30 transition-colors"
          />
        </div>
      ) : (
        <input type="hidden" name={name} value={value || ""} required={required} />
      )}
    </div>
  );
}
