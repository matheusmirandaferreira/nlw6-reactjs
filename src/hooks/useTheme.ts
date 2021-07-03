import { useState } from "react";

export function useTheme() {
  const [theme, setNewTheme] = useState(true)

  setNewTheme(state => !state)

  return theme;
}