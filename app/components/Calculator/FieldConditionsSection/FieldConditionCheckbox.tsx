interface Props {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const FieldConditionCheckbox: React.FC<Props> = ({ label, checked, onChange }) => (
  <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
    <input type="checkbox" checked={checked} onChange={onChange} className="w-auto" /> {label}
  </label>
);
