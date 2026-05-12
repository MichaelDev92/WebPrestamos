"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/shared/components/ui/Input/Input";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import styles from "./ImageUrlsField.module.css";

interface ImageUrlsFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  errors?: Array<string | undefined>;
}

export function ImageUrlsField({ value, onChange, disabled, errors }: ImageUrlsFieldProps) {
  const { t } = useT();
  const items = value.length === 0 ? [""] : value;

  const updateAt = (index: number, newValue: string) => {
    const next = [...items];
    next[index] = newValue;
    onChange(next.filter((entry, i) => entry !== "" || i < next.length - 1));
  };

  const removeAt = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const addEmpty = () => {
    onChange([...items.filter((entry) => entry !== ""), ""]);
  };

  return (
    <div className={styles.wrap}>
      {items.map((entry, index) => (
        <div key={index} className={styles.row}>
          <Input
            type="url"
            value={entry}
            disabled={disabled}
            invalid={Boolean(errors?.[index])}
            placeholder={t("products.form.fields.imageUrlPlaceholder")}
            onChange={(event) => updateAt(index, event.target.value)}
          />
          {(items.length > 1 || entry !== "") && (
            <IconButton
              label={t("common.actions.delete")}
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => removeAt(index)}
            >
              <X size={14} />
            </IconButton>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addEmpty}
        disabled={disabled}
        iconLeft={<Plus size={14} />}
      >
        {t("products.form.fields.addImageUrl")}
      </Button>
    </div>
  );
}
