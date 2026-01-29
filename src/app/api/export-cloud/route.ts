import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

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
  'beesto-4k.svg',
];

const DIRECTORIES = ['src', 'public'];

async function addDirectoryToZip(zip: JSZip, dirPath: string, rootPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(rootPath, fullPath);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        await addDirectoryToZip(zip, fullPath, rootPath);
      }
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(relativePath, content);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, webhookUrl } = await req.json();
    const projectRoot = process.cwd();
    const zip = new JSZip();

    // Add directories
    for (const dir of DIRECTORIES) {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await addDirectoryToZip(zip, dirPath, projectRoot);
      }
    }

    // Add root files
    for (const file of ROOT_FILES) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        zip.file(file, content);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const fileName = `beesto-source-${Date.now()}.zip`;

    if (type === 'discord') {
      if (!webhookUrl) return NextResponse.json({ error: 'Webhook URL required' }, { status: 400 });
      
      const formData = new FormData();
      const blob = new Blob([zipBuffer], { type: 'application/zip' });
      formData.append('file', blob, fileName);
      formData.append('content', '🚀 Your Beesto Project Source Code is ready!');

      const discordRes = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!discordRes.ok) {
        const errText = await discordRes.text();
        throw new Error(`Discord error: ${errText}`);
      }

      return NextResponse.json({ success: true, message: 'Uploaded to Discord!' });
    } 

    if (type === 'bashupload') {
      // Upload to bashupload.com
      const uploadRes = await fetch(`https://bashupload.com/${fileName}`, {
        method: 'PUT',
        body: zipBuffer,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload to bashupload');
      
      const responseText = await uploadRes.text();
      const urlMatch = responseText.match(/https?:\/\/[^\s]+/);
      const downloadUrl = urlMatch ? urlMatch[0] : responseText.trim();
      
      return NextResponse.json({ success: true, url: downloadUrl });
    }

    if (type === 'transfer') {
      // Upload to transfer.sh
      const uploadRes = await fetch(`https://transfer.sh/${fileName}`, {
        method: 'PUT',
        body: zipBuffer,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload to transfer.sh');
      
      const downloadUrl = await uploadRes.text();
      return NextResponse.json({ success: true, url: downloadUrl.trim() });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
