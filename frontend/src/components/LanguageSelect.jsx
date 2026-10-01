import { LANGUAGES } from "../services/api.js";

export default function LanguageSelect({ value, onChange, id = "language" }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
      Language Target
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-[#2B161B] bg-[#0C0C12] px-3.5 py-2 text-xs font-medium text-white transition-all hover:border-[#E62429]/50 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/50 cursor-pointer"
      >
        {LANGUAGES.map((item) => (
          <option key={item.value} value={item.value} className="bg-[#12121A] text-white">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
