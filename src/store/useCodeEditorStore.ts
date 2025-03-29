// src/store/useCodeEditorStore.ts
import { create } from 'zustand';
import { Monaco } from '@monaco-editor/react';

// Define language configurations
export const LANGUAGE_CONFIG = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    logoPath: "/javascript.png",
    pistonRuntime: { language: "javascript", version: "18.15.0" },
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript Playground
const numbers = [1, 2, 3, 4, 5];

// Map numbers to their squares
const squares = numbers.map(n => n * n);
console.log('Original numbers:', numbers);
console.log('Squared numbers:', squares);

// Calculate sum using reduce
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log('Sum of numbers:', sum);`,
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    logoPath: "/typescript.png",
    pistonRuntime: { language: "typescript", version: "5.0.3" },
    monacoLanguage: "typescript",
    defaultCode: `// TypeScript Playground
interface NumberArray {
  numbers: number[];
  sum(): number;
  squares(): number[];
}

class MathOperations implements NumberArray {
  constructor(public numbers: number[]) {}

  sum(): number {
    return this.numbers.reduce((acc, curr) => acc + curr, 0);
  }

  squares(): number[] {
    return this.numbers.map(n => n * n);
  }
}

const math = new MathOperations([1, 2, 3, 4, 5]);
console.log('Sum:', math.sum());
console.log('Squares:', math.squares());`,
  },
  python: {
    id: "python",
    label: "Python",
    logoPath: "/python.png",
    pistonRuntime: { language: "python", version: "3.10.0" },
    monacoLanguage: "python",
    defaultCode: `# Python Playground
numbers = [1, 2, 3, 4, 5]

# Map numbers to their squares
squares = [n ** 2 for n in numbers]
print(f"Original numbers: {numbers}")
print(f"Squared numbers: {squares}")

# Calculate sum
numbers_sum = sum(numbers)
print(f"Sum of numbers: {numbers_sum}")`,
  },
};

// Define editor themes
export const THEMES = [
  { id: "vs-dark", label: "VS Dark", color: "#1e1e1e" },
  { id: "vs-light", label: "VS Light", color: "#ffffff" },
  { id: "github-dark", label: "GitHub Dark", color: "#0d1117" },
];

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

interface CodeEditorState {
  language: string;
  output: string;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: Monaco | null;
  executionResult: ExecutionResult | null;

  getCode: () => string;
  setEditor: (editor: Monaco) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;
}

const getInitialState = () => {
  // If we're on the server, return default values
  if (typeof window === 'undefined') {
    return {
      language: 'javascript',
      fontSize: 16,
      theme: 'vs-dark',
    };
  }

  // If we're on the client, return values from local storage
  const savedLanguage = localStorage.getItem('editor-language') || 'javascript';
  const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark';
  const savedFontSize = localStorage.getItem('editor-font-size') || '16';

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: '',
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || '',

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);

      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem('editor-theme', theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem('editor-font-size', fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem('editor-language', language);

      set({
        language,
        output: '',
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: 'Please enter some code' });
        return;
      }

      set({ isRunning: true, error: null, output: '' });

      try {
        const runtime = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].pistonRuntime;
        
        // Call server API to run code
        const response = await fetch('/api/code/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            code,
          }),
        });

        const data = await response.json();

        // Handle API-level errors
        if (data.error) {
          set({ 
            error: data.error, 
            executionResult: { code, output: '', error: data.error },
            isRunning: false
          });
          return;
        }

        // If we get here, execution was successful
        set({
          output: data.output.trim(),
          error: null,
          executionResult: {
            code,
            output: data.output.trim(),
            error: null,
          },
          isRunning: false
        });
      } catch (error) {
        console.error('Error running code:', error);
        const errorMessage = 'Error running code';
        set({
          error: errorMessage,
          executionResult: { code, output: '', error: errorMessage },
          isRunning: false
        });
      }
    },
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;