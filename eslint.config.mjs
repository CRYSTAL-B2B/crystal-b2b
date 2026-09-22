import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    ".next-avatar/**",
    "crystal-b2b GitHub/**",
    "b2b-system-cinematic-avatar-spec-v2/**",
    "out/**",
    "assets/**",
    "coverage/**",
    "b2b_marketing_site_production_pack_v1/**",
  ]),
]);
