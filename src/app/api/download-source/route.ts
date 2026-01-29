import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export const dynamic = 'force-dynamic';

const ROOT_FILES = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'postcss.config.mjs',
  '.prettierrc',
  'eslint.config.mjs',
  'components.json',
  'README.md',
  'AGENTS.md',
];

const DIRECTORIES = ['src', 'public'];
const BEESTO_4K_ASSET = 'public/beesto-4k.svg';

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const passthrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 5 }, // Moderate compression for speed/memory balance
    });

    // Create the ReadableStream from the passthrough
    const stream = new ReadableStream({
      start(controller) {
        passthrough.on('data', (chunk) => controller.enqueue(chunk));
        passthrough.on('end', () => controller.close());
        passthrough.on('error', (err) => controller.error(err));
      },
      cancel() {
        passthrough.destroy();
        archive.abort();
      }
    });

    archive.pipe(passthrough);

    // Add directories
    for (const dir of DIRECTORIES) {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        archive.directory(dirPath, dir, (data) => {
          if (data.name.includes('node_modules') || data.name.includes('.next')) {
            return false;
          }
          return data;
        });
      }
    }

    // Add root files
    for (const file of ROOT_FILES) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
      }
    }

    // Add Beesto 4K asset to root of zip
    const beesto4kPath = path.join(projectRoot, BEESTO_4K_ASSET);
    if (fs.existsSync(beesto4kPath)) {
      archive.file(beesto4kPath, { name: 'beesto-4k.svg' });
    }

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      passthrough.destroy(err);
    });

    // Finalize the archive
    archive.finalize();

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="beesto-source-${Date.now()}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to create archive' }, { status: 500 });
  }
}
