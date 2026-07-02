"use client";

import type { Editor, Range } from "@tiptap/core";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import styles from "@/app/admin/admin.module.css";

export interface SlashItem {
  title: string;
  hint?: string;
  action: (opts: { editor: Editor; range: Range }) => void;
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(function SlashMenu(
  { items, command },
  ref,
) {
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (!items.length) return false;
      if (event.key === "ArrowDown") {
        setActive((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setActive((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        command(items[active]);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return <div className={styles.slashMenu}>No results</div>;
  }

  return (
    <div className={styles.slashMenu}>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          className={index === active ? styles.slashItemActive : styles.slashItem}
          onClick={() => command(item)}
          onMouseEnter={() => setActive(index)}
        >
          <span className={styles.slashItemLabel}>{item.title}</span>
          {item.hint ? (
            <span className={styles.slashItemHint}>{item.hint}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
});

export default SlashMenu;
