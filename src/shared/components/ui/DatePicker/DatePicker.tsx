"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover } from "@/shared/components/ui/Popover/Popover";
import styles from "./DatePicker.module.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-describedby"?: string;
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const pad = (n: number) => String(n).padStart(2, "0");

function parseISO(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

const toISO = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

function formatDisplay(value: string): string {
  const parsed = parseISO(value);
  return parsed ? `${pad(parsed.d)}/${pad(parsed.m)}/${parsed.y}` : "";
}

/**
 * DatePicker custom con calendario estilizado (glass/tokens), reemplaza al input
 * nativo `type="date"` cuyo calendario lo pinta el navegador (gris, sin diseño).
 * Controlado (value/onChange en formato YYYY-MM-DD). Compatible con FormField.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled = false,
  invalid = false,
  id,
  "aria-describedby": describedBy,
}: DatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const parsed = parseISO(value);
    const now = new Date();
    return parsed
      ? { y: parsed.y, m: parsed.m }
      : { y: now.getFullYear(), m: now.getMonth() + 1 };
  });

  const openPicker = () => {
    const parsed = parseISO(value);
    if (parsed) setView({ y: parsed.y, m: parsed.m });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) close();
    else openPicker();
  };

  const goPrev = () =>
    setView((v) => (v.m === 1 ? { y: v.y - 1, m: 12 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m: v.m + 1 }));

  const firstWeekday = (new Date(view.y, view.m - 1, 1).getDay() + 6) % 7; // lunes primero
  const daysInMonth = new Date(view.y, view.m, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const display = formatDisplay(value);

  const selectDay = (day: number) => {
    onChange(toISO(view.y, view.m, day));
    close();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        className={clsx(styles.trigger, invalid && styles.invalid, open && styles.open)}
        onClick={handleToggle}
      >
        <span className={clsx(styles.value, !display && styles.placeholder)}>
          {display || placeholder}
        </span>
        <Calendar size={16} className={styles.icon} aria-hidden="true" />
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={close} matchWidth={false}>
        <div className={styles.calendar} role="dialog" aria-label="Seleccionar fecha">
          <div className={styles.head}>
            <button type="button" className={styles.navBtn} onClick={goPrev} aria-label="Mes anterior">
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>
              {MONTHS[view.m - 1]} {view.y}
            </span>
            <button type="button" className={styles.navBtn} onClick={goNext} aria-label="Mes siguiente">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className={styles.weekday}>
                {weekday}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} className={styles.dayEmpty} />;
              const iso = toISO(view.y, view.m, day);
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  className={clsx(
                    styles.day,
                    isToday && styles.today,
                    isSelected && styles.selected,
                  )}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </Popover>
    </>
  );
}
