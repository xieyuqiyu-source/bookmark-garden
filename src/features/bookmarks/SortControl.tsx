import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Dialog } from "../../components/Dialog";
const options = [
  { value: "original", label: "书签顺序" },
  { value: "title", label: "名称排序" },
  { value: "recent", label: "最近添加" },
];
export function SortControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>();
  return (
    <div className="sort-control">
      <button
        ref={button}
        className="sort-trigger glass"
        aria-label={`书签排序：${options.find((option) => option.value === value)?.label}`}
        aria-haspopup="menu"
        aria-expanded={!!position}
        onClick={() => {
          const rect = button.current!.getBoundingClientRect();
          setPosition({
            left: Math.max(
              8,
              Math.min(rect.right - 184, window.innerWidth - 192),
            ),
            top:
              rect.bottom + 160 < window.innerHeight
                ? rect.bottom + 8
                : Math.max(8, rect.top - 156),
          });
        }}
      >
        <span>{options.find((option) => option.value === value)?.label}</span>
        <ChevronDown size={15} />
      </button>
      {position && (
        <Dialog
          className="bookmark-menu sort-menu"
          label="书签排序"
          style={position}
          onClose={() => setPosition(undefined)}
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="menuitemradio"]',
              ),
            );
            const index = items.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      items.length) %
                    items.length;
            items[next]?.focus();
          }}
        >
          {(close) => (
            <div role="menu" aria-label="书签排序">
              {options.map((option) => (
                <button
                  key={option.value}
                  role="menuitemradio"
                  aria-checked={value === option.value}
                  autoFocus={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                >
                  <span>{option.label}</span>
                  <Check size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
