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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@wso2/oxygen-ui";

import { createContext, useCallback, useContext, useState } from "react";

interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: DialogOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: "", message: "" },
    resolve: null,
  });

  const showDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    dialogState.resolve?.(result);
    setDialogState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <Dialog open={dialogState.open} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogState.options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogState.options.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>
            {dialogState.options.cancelLabel || "Cancel"}
          </Button>
          <Button onClick={() => handleClose(true)} variant="contained" autoFocus>
            {dialogState.options.confirmLabel || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export default DialogContext;
