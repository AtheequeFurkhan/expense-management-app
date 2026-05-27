// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
import { createContext, useContext, useState } from "react";

export type AppThemeName = "orange" | "purple" | "base";

export const THEMES: { name: AppThemeName; label: string; color: string; ring: string }[] = [
  { name: "orange", label: "Sunrise",   color: "#f97316", ring: "#fed7aa" },
  { name: "purple", label: "Amethyst",  color: "#7c3aed", ring: "#ede9fe" },
  { name: "base",   label: "Slate",     color: "#64748b", ring: "#e2e8f0" },
];

const STORAGE_KEY = "appTheme";

interface ThemeContextValue {
  themeName: AppThemeName;
  setThemeName: (t: AppThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeName: "orange",
  setThemeName: () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<AppThemeName>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const valid: AppThemeName[] = ["orange", "purple", "base"];
    return valid.includes(stored as AppThemeName) ? (stored as AppThemeName) : "orange";
  });

  const setThemeName = (t: AppThemeName) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
