import { verifyYearArchivePackage } from "./lib/classroom-year-archive-package.mjs";
if (process.argv.length !== 3) throw new Error("Provide the exact candidate directory to verify.");
console.log(JSON.stringify(await verifyYearArchivePackage(process.argv[2]), null, 2));
