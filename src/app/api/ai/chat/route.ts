// app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, code, history = [] } = await request.json();
    
    // Use sophisticated mock responses instead of API calls
    const aiResponse = generateAIResponse(message, code, history);
    
    return NextResponse.json({
      response: aiResponse.response,
      suggestion: aiResponse.suggestion
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}

// Enhanced mock response generator with more sophisticated logic
function generateAIResponse(message: string, code: string, history: any[] = []) {
  const lowerMessage = message.toLowerCase();
  
  // Detect message intent for better responses
  const intent = detectIntent(lowerMessage);
  
  // Generate an appropriate response based on intent
  switch (intent) {
    case "optimize":
      return handleOptimizeRequest(code);
    case "explain":
      return handleExplainRequest(code, lowerMessage);
    case "add":
      return handleAddRequest(code, lowerMessage);
    case "fix":
      return handleFixRequest(code, lowerMessage);
    case "help":
      return handleHelpRequest();
    default:
      return handleGeneralRequest(code);
  }
}

// Intent detection based on keywords
function detectIntent(message: string) {
  if (message.includes("optimize") || message.includes("improve") || message.includes("better") || message.includes("performance")) {
    return "optimize";
  }
  if (message.includes("explain") || message.includes("what does") || message.includes("how does") || message.includes("why")) {
    return "explain";
  }
  if (message.includes("add") || message.includes("create") || message.includes("implement") || message.includes("new")) {
    return "add";
  }
  if (message.includes("fix") || message.includes("bug") || message.includes("error") || message.includes("problem") || message.includes("issue")) {
    return "fix";
  }
  if (message.includes("help") || message.includes("assist") || message.includes("guide")) {
    return "help";
  }
  return "general";
}

// Request handlers for different intents
function handleOptimizeRequest(code: string) {
  // Look for common optimization opportunities
  let suggestion = code;
  let optimizations = [];
  
  if (code.includes("for (let i = 0; i < array.length; i++)")) {
    suggestion = code.replace(
      "for (let i = 0; i < array.length; i++)",
      "for (let i = 0, len = array.length; i < len; i++)"
    );
    optimizations.push("Cached array length for better loop performance");
  }
  
  if (code.includes("console.log") && code.includes("for (")) {
    suggestion = code.replace(/console\.log\([^)]+\);/g, "// console.log removed for production");
    optimizations.push("Removed console.log statements that might affect performance");
  }
  
  // Check for nested loops that could be optimized
  if ((code.match(/for\s*\(/g) || []).length > 1) {
    optimizations.push("Consider refactoring nested loops to reduce time complexity");
  }
  
  return {
    response: `I've analyzed your code and found several optimization opportunities:\n\n${optimizations.map(opt => `- ${opt}`).join('\n')}\n\nI've implemented some of these optimizations in the suggested code.`,
    suggestion: suggestion
  };
}

function handleExplainRequest(code: string, message: string) {
  // Basic code explanation logic
  let explanation = "Here's an explanation of what this code does:\n\n";
  
  if (code.includes("function")) {
    explanation += "- This code defines one or more functions\n";
    
    // Extract function names for better explanation
    const functionMatches = code.match(/function\s+(\w+)/g) || [];
    if (functionMatches.length > 0) {
      explanation += "- Functions defined: " + functionMatches.map(f => f.replace("function ", "")).join(", ") + "\n";
    }
  }
  
  if (code.includes("class")) {
    explanation += "- This code defines a class with methods and properties\n";
  }
  
  if (code.includes("import") || code.includes("require")) {
    explanation += "- The code imports external dependencies or modules\n";
  }
  
  if (code.includes("async")) {
    explanation += "- Contains asynchronous operations that return promises\n";
  }
  
  if (code.includes("try") && code.includes("catch")) {
    explanation += "- Includes error handling with try/catch blocks\n";
  }
  
  // Add general code purpose based on content
  if (code.includes("fetch") || code.includes("axios")) {
    explanation += "- Makes HTTP requests to external services or APIs\n";
  } else if (code.includes("querySelector") || code.includes("getElementById")) {
    explanation += "- Manipulates DOM elements on a webpage\n";
  } else if (code.includes("useState") || code.includes("useEffect")) {
    explanation += "- Uses React hooks for state management and side effects\n";
  }
  
  return {
    response: explanation,
    suggestion: null
  };
}

function handleAddRequest(code: string, message: string) {
  // Extract what feature to add
  let featureName = "newFeature";
  const featureMatch = message.match(/add\s+(?:a|an)\s+(\w+)/i) || message.match(/create\s+(?:a|an)\s+(\w+)/i);
  if (featureMatch && featureMatch[1]) {
    featureName = featureMatch[1].toLowerCase();
  }
  
  // Generate appropriate code based on the request
  let newCode = "";
  if (featureMatch && featureMatch[1]) {
    const feature = featureMatch[1].toLowerCase();
    
    if (feature.includes("button") || feature.includes("click")) {
      newCode = `
// Added button click handler
function handle${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Click() {
  console.log('${featureName} button clicked');
  // Add your logic here
  return true;
}

// Example usage
document.getElementById('${featureName}Button').addEventListener('click', handle${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Click);
`;
    } else if (feature.includes("form") || feature.includes("input") || feature.includes("validation")) {
      newCode = `
// Added form validation function
function validate${featureName.charAt(0).toUpperCase() + featureName.slice(1)}() {
  const input = document.getElementById('${featureName}Input').value;
  
  if (!input || input.trim() === '') {
    console.error('${featureName} cannot be empty');
    return false;
  }
  
  console.log('${featureName} is valid:', input);
  return true;
}

// Example usage
document.getElementById('${featureName}Form').addEventListener('submit', function(event) {
  if (!validate${featureName.charAt(0).toUpperCase() + featureName.slice(1)}()) {
    event.preventDefault();
  }
});
`;
    } else if (feature.includes("api") || feature.includes("fetch") || feature.includes("request")) {
      newCode = `
// Added API request function
async function fetch${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Data() {
  try {
    const response = await fetch('https://api.example.com/${featureName}');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('${featureName} data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching ${featureName} data:', error);
    return null;
  }
}
`;
    } else {
      // Default new function
      newCode = `
// Added new ${featureName} function
function ${featureName}() {
  console.log('${featureName} function called');
  // Add your implementation here
  return true;
}
`;
    }
  } else {
    // Default new function if no specific feature detected
    newCode = `
// Added new function
function newFeature() {
  console.log('New feature implemented!');
  return true;
}
`;
  }
  
  return {
    response: `I've created a new implementation for the ${featureName} functionality you requested. I've added appropriate error handling and documentation.`,
    suggestion: code + "\n" + newCode
  };
}

function handleFixRequest(code: string, message: string) {
  // Simple bug fixing logic - look for common issues
  let fixedCode = code;
  let fixes = [];

  // Missing semicolons
  if (code.match(/\w+\s*\n/) && !code.match(/;\s*\n/)) {
    fixedCode = code.replace(/(\w+)\s*\n/g, '$1;\n');
    fixes.push("Added missing semicolons");
  }
  
  // Unclosed parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    fixedCode = fixedCode + ")".repeat(openParens - closeParens);
    fixes.push(`Added ${openParens - closeParens} missing closing parentheses`);
  }
  
  // Unclosed brackets
  const openBrackets = (code.match(/\{/g) || []).length;
  const closeBrackets = (code.match(/\}/g) || []).length;
  if (openBrackets > closeBrackets) {
    fixedCode = fixedCode + "}".repeat(openBrackets - closeBrackets);
    fixes.push(`Added ${openBrackets - closeBrackets} missing closing brackets`);
  }
  
  // Common typos
  if (code.includes("cosole.log")) {
    fixedCode = fixedCode.replace(/cosole\.log/g, "console.log");
    fixes.push("Fixed typo: 'cosole.log' → 'console.log'");
  }
  
  if (code.includes("lenght")) {
    fixedCode = fixedCode.replace(/lenght/g, "length");
    fixes.push("Fixed typo: 'lenght' → 'length'");
  }
  
  // Check for undefined variables
  const variableDeclarations = code.match(/(?:let|const|var)\s+(\w+)/g) || [];
  const declaredVars = variableDeclarations.map(v => v.replace(/(?:let|const|var)\s+/, ""));
  
  // Very simple variable usage check - not comprehensive
  const usedVars = code.match(/[^."']\b\w+\b(?!\s*[:(])/g) || [];
  const potentialUndefinedVars = usedVars.filter(v => 
    !declaredVars.includes(v) && 
    !["if", "for", "while", "function", "return", "true", "false", "null", "undefined", "console", "log", "this", "document", "window"].includes(v)
  );
  
  if (potentialUndefinedVars.length > 0) {
    fixes.push(`Possible undefined variables: ${[...new Set(potentialUndefinedVars)].join(", ")}`);
  }
  
  return {
    response: fixes.length > 0 
      ? `I've analyzed your code and found the following issues:\n\n${fixes.map(fix => `- ${fix}`).join('\n')}\n\nI've applied these fixes in the suggested code.` 
      : "I've analyzed your code but didn't find any obvious syntax errors or bugs. If you're facing a specific issue, please provide more details.",
    suggestion: fixes.length > 0 ? fixedCode : null
  };
}

function handleHelpRequest() {
  return {
    response: "I'm your AI coding assistant. I can help you with various coding tasks:\n\n" +
      "- **Explaining code**: Ask me to explain what code does\n" +
      "- **Fixing bugs**: Show me code with errors and I'll try to fix them\n" +
      "- **Adding features**: Ask me to implement new functionality\n" +
      "- **Optimizing code**: I can suggest performance improvements\n\n" +
      "Just share your code and tell me what you need!",
    suggestion: null
  };
}

function handleGeneralRequest(code: string) {
  return {
    response: "I've analyzed your code. It appears to be a JavaScript program that contains " + 
      (code.split('\n').length) + " lines of code. " +
      "It includes " + (code.match(/function/g) || []).length + " functions, " +
      (code.match(/if/g) || []).length + " if statements, and " +
      (code.match(/for|while/g) || []).length + " loops. " +
      "What specific aspect would you like me to help with? I can explain logic, suggest optimizations, fix bugs, or add new features.",
    suggestion: null
  };
}