"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Sidebar.module.css";
import AllNotesIcon from "../icons/AllNotesIcon";
import TodosIcon from "../icons/TodosIcon";
import DoneIcon from "../icons/DoneIcon";
import RecurringIcon from "../icons/RecurringIcon";
import WaitingFollowupIcon from "../icons/WaitingFollowupIcon";
interface SidebarProps {
  onCategoryChange?: (category: string | null) => void;
}

export default function Sidebar({ onCategoryChange }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("all");

  const handleItemClick = (id: string, category: string | null) => {
    setActiveItem(id);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const menuItems = [
    {
      id: "all",
      label: "Toutes les notes",
      icon: AllNotesIcon,
      category: null,
    },
    { id: "todo", label: "À faire", icon: TodosIcon, category: "todo" },
    { id: "done", label: "Fait", icon: DoneIcon, category: "done" },
    {
      id: "recurring",
      label: "Tâches cycliques",
      icon: RecurringIcon,
      category: "recurring",
    },
    {
      id: "waiting",
      label: "Attente de retour",
      icon: WaitingFollowupIcon,
      category: "waiting_followup",
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <Link href="/dashboard" className={styles.logo}>
        <Image
          src="/svg/app.svg"
          alt="Cripan'"
          width={32}
          height={32}
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>
          Cripan<mark>f</mark>
        </span>
      </Link>

      <nav className={styles.section}>
        <h2 className={styles.sectionTitle}>Espace de travail</h2>
        <ul className={styles.list}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`${styles.item} ${
                    activeItem === item.id ? styles.itemActive : ""
                  }`}
                  onClick={() => handleItemClick(item.id, item.category)}
                  data-category={item.category}
                >
                  <IconComponent className={styles.itemIcon} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
