import { capitalize } from "@/utils";

interface DropdownProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: string[];
  flat?: boolean;
  bgColor?: string;
  showLabel?: boolean;
  allowEmptyDefault?: boolean;
}

export default function Dropdown({ label, showLabel=true, value, onChange, items, flat=true, bgColor='#0c7be910', allowEmptyDefault=true }: DropdownProps) {
  return (
    <div className={`${flat? 'flex gap-2 items-center': ''}`}>
      {showLabel && <p className="text-gray-400 text-sm mb-1">{label}</p>}
      
      <div className={`bg-[${bgColor}] px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer`}>
        <select
          className="bg-transparent outline-none w-full text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {allowEmptyDefault &&
          <option value="" className="bg-[#08121C]">
             All {label}
          </option>
          }
          {items.map((item) => (
            <option key={item.trim()} value={item.trim()} className="bg-[#08121C]">
              {capitalize(item.trim())}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}