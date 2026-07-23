"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import clsx from "clsx";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "@/shared/components/ui/Popover/Popover";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
  "aria-describedby"?: string;
}

/**
 * Select custom con panel estilizado (glass/tokens), reemplaza al `<select>` nativo
 * cuya lista desplegable la pinta el SO y no puede seguir el diseño del padre.
 * Controlado (value/onChange). Compatible con FormField (recibe id + aria-describedby).
 */
export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Seleccione",
  disabled = false,
  invalid = false,
  searchable = false,
  searchPlaceholder = "Buscar...",
  emptyLabel = "Sin resultados",
  id,
  "aria-describedby": describedBy,
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query, searchable]);

  const openDropdown = () => {
    setQuery("");
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) close();
    else openDropdown();
  };

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus();
      else listRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelectorAll<HTMLElement>("[role='option']")[activeIndex];
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const selectOption = (option: DropdownOption) => {
    onChange(option.value);
    close();
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openDropdown();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={clsx(styles.trigger, invalid && styles.invalid, open && styles.open)}
        onClick={handleToggle}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={clsx(styles.value, !selected && styles.placeholder)}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          aria-hidden="true"
        />
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={close} matchWidth>
        {searchable && (
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={searchRef}
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onListKeyDown}
            />
          </div>
        )}
        <div
          ref={listRef}
          className={styles.list}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {filtered.length === 0 ? (
            <div className={styles.empty}>{emptyLabel}</div>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx(
                    styles.option,
                    isActive && styles.active,
                    isSelected && styles.selected,
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && <Check size={14} className={styles.check} aria-hidden="true" />}
                </button>
              );
            })
          )}
        </div>
      </Popover>
    </>
  );
}
