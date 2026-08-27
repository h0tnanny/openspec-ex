import { generateSpecViewer } from '../core/viewer/viewer-builder';
import { logger } from '../utils/logger';

const targetDir = process.argv[2] || process.cwd();
try {
  const outputPath = generateSpecViewer(targetDir);
  logger.success(`Spec Viewer generated: ${outputPath}`);
} catch (e: any) {
  logger.error(`Error generating spec viewer: ${e.message}`);
  process.exit(1);
}
