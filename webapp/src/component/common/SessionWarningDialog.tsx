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
import { Clock } from "@wso2/oxygen-ui-icons-react";

interface SessionWarningDialogProps {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
}

function SessionWarningDialog({ open, onExtend, onLogout }: SessionWarningDialogProps) {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Clock size={22} />
        Session Expiring
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your session is about to expire. Would you like to extend your session or log out?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="error">
          Log Out
        </Button>
        <Button onClick={onExtend} variant="contained" autoFocus>
          Extend Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionWarningDialog;