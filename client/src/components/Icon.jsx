/* Line icons drawn for ChefHive. Usage: <Icon name="diya" /> */
const PATHS = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  sparkles: <><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  diya: <><path d="M12 2.5c1.6 2 2.2 3.3 2.2 4.5a2.2 2.2 0 0 1-4.4 0c0-1.2.6-2.5 2.2-4.5z" /><path d="M2.5 12.5h19c-.9 4-4.8 6.5-9.5 6.5s-8.6-2.5-9.5-6.5z" /><path d="M9 21.5h6" /></>,
  baby: <><circle cx="12" cy="12.5" r="8" /><path d="M9.5 11.5h.01M14.5 11.5h.01" /><path d="M10 15.5c1.2.8 2.8.8 4 0" /><path d="M12 4.5c-1.2 1-1.2 2.2 0 3" /></>,
  cake: <><path d="M4 21h16v-8H4z" /><path d="M4 16.5c2.7 1.5 5.3 1.5 8 0s5.3-1.5 8 0" /><path d="M8 13V9.5M12 13V9.5M16 13V9.5" /><path d="M8 6.5v.01M12 6.5v.01M16 6.5v.01" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  lotus: <><path d="M12 20.5c-5 0-9-3-9-7 3 0 6 1.5 9 4.5 3-3 6-4.5 9-4.5 0 4-4 7-9 7z" /><path d="M12 18c-2.5-2.5-3.5-6-3-10 1.7.8 2.7 2 3 3.5.3-1.5 1.3-2.7 3-3.5.5 4-.5 7.5-3 10z" /></>,
  dots: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  leaf: <><path d="M5 19C5 11 10 5 20 4c-1 10-7 15-15 15z" /><path d="M5 19l9-9" /></>,
  chef: <><path d="M7 14a4 4 0 0 1-.9-7.9A5 5 0 0 1 12 3a5 5 0 0 1 5.9 3.1A4 4 0 0 1 17 14" /><path d="M7 14h10v6H7z" /><path d="M7 17h10" /></>,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  rupee: <path d="M6 4h12M6 9h12M13 21L6 13h3a4.5 4.5 0 0 0 0-9" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  chat: <><path d="M4 20l1.4-4.2A8.5 8.5 0 1 1 8.2 19z" /><path d="M9 11h.01M12.5 11h.01M16 11h.01" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
  pot: <><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M2 10h20" /><path d="M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  utensils: <><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10" /><path d="M17 21V3c-2 1.5-3 4-3 7h3" /></>,
  heart: <path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z" />,
  book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
};

export default function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name] || PATHS.dots}
    </svg>
  );
}
