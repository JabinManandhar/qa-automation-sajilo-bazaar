<!-- 1. Make sure Node types are installed -->
npm install -D typescript @types/node

<!-- 2. Create a tsconfig.json in your project root -->
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["tests/**/*.ts", "playwright.config.ts"]
}