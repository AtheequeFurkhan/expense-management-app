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
import { Backdrop, CircularProgress, useTheme } from "@wso2/oxygen-ui";

interface BackdropProgressProps {
  open: boolean;
}

function BackdropProgress({ open }: BackdropProgressProps) {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        color: theme.palette.common.white,
        zIndex: theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default BackdropProgress;