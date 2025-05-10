
import {
  instructionManagerCode,
  instructionBoxCode, 
  instructionToggleCode,
  instructionContextCode,
  instructionManagementTableCode,
  appModificationCode
} from './instructionToolCode';

// Function to collect all code files related to the instruction tool
export const collectInstructionToolCode = (): Record<string, string> => {
  // Return an object with file paths and their content
  return {
    "components/instructions/InstructionManager.tsx": instructionManagerCode,
    "components/instructions/InstructionBox.tsx": instructionBoxCode,
    "components/instructions/InstructionModeToggle.tsx": instructionToggleCode,
    "contexts/InstructionContext.tsx": instructionContextCode,
    "components/admin/InstructionManagementTable.tsx": instructionManagementTableCode,
    "App.tsx (modifications)": appModificationCode,
  };
};

// Function to create a downloadable blob with the instruction tool code
export const generateCodeBundle = async (): Promise<void> => {
  // Get the code files
  const codeFiles = collectInstructionToolCode();
  
  // Create a human-readable representation of the code structure
  let bundleContent = "# Instruction Tool - Code Export\n\n";
  bundleContent += "This bundle contains the following files required for the Instruction Tool:\n\n";
  
  // Add each file with its content
  Object.entries(codeFiles).forEach(([filePath, codeContent]) => {
    bundleContent += `## ${filePath}\n\n`;
    bundleContent += "```typescript\n";
    bundleContent += codeContent.trim();
    bundleContent += "\n```\n\n";
  });
  
  // Add implementation instructions
  bundleContent += "## Implementation Steps\n\n";
  bundleContent += "1. Copy the InstructionManager.tsx, InstructionBox.tsx, and InstructionModeToggle.tsx files to your project's components/instructions directory\n";
  bundleContent += "2. Copy the InstructionManagementTable.tsx file to your project's components/admin directory\n";
  bundleContent += "3. Copy the InstructionContext.tsx file to your project's contexts directory\n";
  bundleContent += "4. Add the InstructionProvider to your App.tsx file\n";
  bundleContent += "5. Add the InstructionManager component inside your router in App.tsx\n";
  bundleContent += "6. Add the InstructionModeToggle to your navigation or admin UI\n";
  bundleContent += "7. Add the InstructionManagementTable to your admin dashboard\n\n";
  
  bundleContent += "## Dependencies\n\n";
  bundleContent += "This component relies on:\n";
  bundleContent += "- React & React DOM\n";
  bundleContent += "- React Router (for page path detection)\n";
  bundleContent += "- Tailwind CSS (for styling)\n";
  bundleContent += "- Shadcn UI components (Button, Switch, Dialog, Card, etc.)\n";
  bundleContent += "- Lucide React (for icons)\n";
  
  // Create a blob with the content
  const blob = new Blob([bundleContent], { type: 'text/markdown' });
  
  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'instruction-tool-export.md';
  
  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
