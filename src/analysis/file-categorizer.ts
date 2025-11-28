import { FileDiff } from "../git/diff-parser";

export enum FileCategory {
  CRITICAL = "critical",
  NORMAL = "normal",
  LOW = "low",
}

export interface CategorizedFiles {
  critical: FileDiff[];
  normal: FileDiff[];
  low: FileDiff[];
}

const CRITICAL_PATTERNS = [
  // Database & Migrations
  /\.sql$/i,
  /migrations?\//i,
  /schema\.(ts|js|sql)$/i,
  /database\//i,

  // Configuration
  /(^|\/)config\.(ts|js|json|ya?ml)$/i,
  /\.env/i,

  // Infrastructure
  /docker/i,
  /\.tf$/i,
  /k8s|kubernetes/i,
  /nginx\.conf/i,

  // Dependencies & Lock files
  /package\.json$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /Cargo\.lock$/,
  /Cargo\.toml$/,
  /go\.mod$/,
  /go\.sum$/,
  /Podfile(\.lock)?$/,
  /build\.gradle(\.kts)?$/,
  /settings\.gradle(\.kts)?$/,
  /Gemfile(\.lock)?$/,
  /composer\.(json|lock)$/,

  // Security & Auth
  /auth|authentication/i,
  /middleware.*auth/i,
  /security\//i,
  /(^|\/)permissions?\.(ts|js|kt|swift|rs)$/i,
  /rbac\//i,
  /jwt/i,
  /oauth/i,
  /session/i,

  // Framework configs
  /next\.config\.(js|ts|mjs)$/i,
  /remix\.config\.(js|ts)$/i,
  /svelte\.config\.(js|ts)$/i,
  /vite\.config\.(js|ts)$/i,
  /webpack\.config\.(js|ts)$/i,
  /rollup\.config\.(js|ts)$/i,
  /tsconfig(\..*)?\.json$/i,
  /angular\.json$/i,
  /vue\.config\.(js|ts)$/i,
  /nuxt\.config\.(js|ts)$/i,

  // Server & Core application
  /server\.(ts|js|rs|cpp)$/i,
  /(^|\/)main\.(ts|js|rs|cpp|swift|kt)$/i,
  /\/src\/index\.(ts|js)$/i,
  /app\.(ts|js|tsx|jsx)$/i,
  /_app\.(ts|js|tsx|jsx)$/i,
  /root\.(ts|tsx)$/i,
  /__layout\.(svelte|ts)$/i,
  /app\.module\.(ts|js)$/i,
  /\/core\//i,
  /\/kernel\//i,
  /\/engine\//i,

  // Networking & Security middleware
  /proxy/i,
  /cors/i,
  /helmet/i,
  /rate-?limit/i,
  /csp\./i,

  // Rust critical files
  /\/lib\.rs$/,
  /\/main\.rs$/,
  /\/mod\.rs$/,

  // C++ critical files
  /\.(h|hpp|hxx)$/i,
  /CMakeLists\.txt$/i,
  /Makefile$/i,
  /\.cmake$/i,

  // Swift/iOS critical
  /AppDelegate\.swift$/i,
  /SceneDelegate\.swift$/i,
  /Info\.plist$/i,
  /\.xcodeproj\//i,
  /\.xcworkspace\//i,
  /\.pbxproj$/,
  /Entitlements\.plist$/i,

  // Kotlin/Android critical
  /AndroidManifest\.xml$/i,
  /MainActivity\.(kt|java)$/i,
  /Application\.(kt|java)$/i,
  /proguard-rules\.pro$/i,
  /gradle\.properties$/i,

  // State management
  /\/store\//i,
  /redux/i,
  /zustand/i,
  /recoil/i,
  /jotai/i,
  /mobx/i,
  /\/state\//i,
  /\/context\//i,

  // Error handling & Monitoring
  /error-?handler/i,
  /sentry/i,
  /error-?boundary/i,
  /logger/i,
  /logging/i,

  // Build tools
  /.swiftpm\//i,
  /Package\.swift$/i,
  /project\.pbxproj$/i,
];

const LOW_PATTERNS = [
  // Tests
  /\.test\.(ts|js|tsx|jsx|rs|cpp|swift|kt)$/i,
  /\.spec\.(ts|js|tsx|jsx|rs|cpp|swift|kt)$/i,
  /__tests__\//i,
  /_tests?\//i,
  /\/tests?\//i,

  // Documentation
  /\.md$/i,
  /docs?\//i,
  /readme/i,
  /\.txt$/i,
  /changelog/i,
  /license/i,
  /contributing/i,

  // Stories & examples
  /\.stories\.(ts|js|tsx|jsx)$/i,
  /\.example\.(ts|js|tsx|jsx|rs|cpp|swift|kt)$/i,
  /\/examples?\//i,
  /\/stories\//i,

  // Mock data
  /\/mocks?\//i,
  /\/fixtures?\//i,
  /\.mock\.(ts|js|tsx|jsx)$/i,

  // Assets (usually versioned separately or not critical)
  /\.png$/i,
  /\.jpg$/i,
  /\.jpeg$/i,
  /\.gif$/i,
  /\.svg$/i,
  /\.ico$/i,
  /\/assets?\//i,
  /\/static\//i,
  /\/public\//i,
];

const API_PATTERNS = [
  // REST API
  /\/api\//i,
  /\/routes?\//i,
  /\/controllers?\//i,
  /\/endpoints?\//i,
  /\.route\.(ts|js)$/i,
  /\.controller\.(ts|js|kt|swift|rs)$/i,
  /\/handlers?\//i,

  // Services layer
  /\/services?\//i,
  /\.service\.(ts|js|kt|swift|rs)$/i,

  // GraphQL
  /\/graphql\//i,
  /\.resolver\.(ts|js)$/i,
  /\.gql$/i,
  /\.graphql$/i,
  /schema\.graphql$/i,

  // RPC
  /\/trpc\//i,
  /\/grpc\//i,
  /\.proto$/i,

  // Webhooks
  /\/webhooks?\//i,
  /webhook/i,

  // API versioning
  /\/v\d+\//i,
];

export function categorizeFiles(files: FileDiff[]): CategorizedFiles {
  const categorized: CategorizedFiles = {
    critical: [],
    normal: [],
    low: [],
  };

  for (const file of files) {
    const category = categorizeFile(file);
    categorized[category].push(file);
  }

  return categorized;
}

function categorizeFile(file: FileDiff): FileCategory {
  if (file.isBinary) {
    return FileCategory.LOW;
  }

  if (matchesPatterns(file.path, CRITICAL_PATTERNS)) {
    return FileCategory.CRITICAL;
  }

  if (matchesPatterns(file.path, API_PATTERNS)) {
    return FileCategory.CRITICAL;
  }

  if (matchesPatterns(file.path, LOW_PATTERNS)) {
    return FileCategory.LOW;
  }

  if (file.additions + file.deletions < 10) {
    return FileCategory.LOW;
  }

  return FileCategory.NORMAL;
}

function matchesPatterns(path: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(path));
}

export function hasBreakingChangeMarkers(file: FileDiff): boolean {
  const diff = file.diff.toLowerCase();

  if (diff.includes("-export ") && !diff.includes("+export ")) {
    return true;
  }

  if (diff.match(/-\s*(function|const|export|pub|public)\s+\w+\s*\(/)) {
    return true;
  }

  if (diff.match(/alter table|drop (table|column)|rename (table|column)/i)) {
    return true;
  }

  if (diff.match(/-(get|post|put|delete|patch)\s*\(/i)) {
    return true;
  }

  return false;
}
