"use client";
import { useId, useState } from "react";
import { PencilSimple, Check, X } from "@phosphor-icons/react";
import { formatQuantity } from "@/lib/shopping";
import { supportedUnits } from "@/services/grocery";

export function EditableQuantity({
  quantity,
  unit,
  disabled,
  onSave,
  name,
}: {
  quantity: number;
  unit: string;
  disabled: boolean;
  onSave: (quantity: number, unit: string) => Promise<void>;
  name: string;
}) {
  const controlId = useId();
  const [editing, setEditing] = useState(false),
    [amount, setAmount] = useState(quantity),
    [measure, setMeasure] = useState(unit);
  return editing ? (
    <form
      className="quantity-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(amount, measure);
        setEditing(false);
      }}
    >
      <label className="sr-only" htmlFor={`${controlId}-quantity`}>
        Quantity for {name}
      </label>
      <input
        id={`${controlId}-quantity`}
        type="number"
        min="0.001"
        max="100000"
        step="any"
        required
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <label className="sr-only" htmlFor={`${controlId}-unit`}>
        Unit for {name}
      </label>
      <select
        id={`${controlId}-unit`}
        value={measure}
        onChange={(e) => setMeasure(e.target.value)}
      >
        {supportedUnits.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={disabled}
        className="icon-button"
        aria-label={`Save quantity for ${name}`}
      >
        <Check size={18} />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label="Cancel editing"
        onClick={() => setEditing(false)}
      >
        <X size={17} />
      </button>
    </form>
  ) : (
    <button
      disabled={disabled}
      className="quantity-button"
      aria-label={`Edit ${name}, ${formatQuantity(quantity, unit)}`}
      onClick={() => {
        setAmount(quantity);
        setMeasure(unit);
        setEditing(true);
      }}
    >
      {formatQuantity(quantity, unit)}
      <PencilSimple size={14} />
    </button>
  );
}
