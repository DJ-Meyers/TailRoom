interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

export const FieldConditionSelect = <T extends string>({ label, options, value, onChange }: Props<T>) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange((e.target.value || undefined) as T | undefined);

  return (
    <label className="flex flex-col min-w-[100px]">
      <span className="text-[0.7rem] font-semibold text-text-dim mb-0.5">{label}</span>
      <select
        value={value ?? ''}
        onChange={handleChange}
        className="px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:border-primary"
      >
        <option value="">(none)</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
};
