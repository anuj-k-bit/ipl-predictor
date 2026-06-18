// src/components/CustomDropdown.tsx
// Custom dropdown with colored team dot indicators
import { useState, useRef, useEffect } from "react";
import { getTeamColor } from "../teamColors";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  showDot?: boolean;   // show brand-color dot for this option
}

interface Props {
  id: string;
  value: string;
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CustomDropdown = ({ id, value, placeholder, options, onChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      id={id}
      className={`custom-dropdown${open ? " open" : ""}${disabled ? " disabled" : ""}`}
      ref={ref}
    >
      {/* Trigger */}
      <button
        type="button"
        className="custom-dropdown__trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="custom-dropdown__value">
          {selected ? (
            <>
              {selected.showDot && (
                <span
                  className="team-dot"
                  style={{ background: getTeamColor(selected.value) }}
                />
              )}
              {selected.label}
            </>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>{placeholder}</span>
          )}
        </span>
        <svg
          className={`custom-dropdown__arrow${open ? " rotated" : ""}`}
          width="12" height="12" viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <ul className="custom-dropdown__menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value || "__placeholder__"}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-dropdown__item${opt.value === value ? " selected" : ""}${opt.disabled ? " item-disabled" : ""}`}
              onClick={() => {
                if (!opt.disabled && opt.value) {
                  onChange(opt.value);
                  setOpen(false);
                }
              }}
            >
              {opt.showDot && opt.value && (
                <span
                  className="team-dot"
                  style={{ background: getTeamColor(opt.value) }}
                />
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
