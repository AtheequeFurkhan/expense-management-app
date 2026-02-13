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
import { Box, Tab, Tabs } from "@wso2/oxygen-ui";

import { useState } from "react";

interface TabConfig {
  label: string;
  content: React.ReactNode;
}

interface TabsPageProps {
  tabs?: TabConfig[];
}

function TabsPage({ tabs = [] }: TabsPageProps) {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <Box>
      <Tabs value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ pt: 2 }}>{tabs[value]?.content}</Box>
    </Box>
  );
}

export default TabsPage;
