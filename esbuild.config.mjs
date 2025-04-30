import esbuild from 'esbuild';
import process from 'process';

const isProd = process.argv[2] === 'production';

const ctx = await esbuild.context({
    entryPoints: ['main.js'],
    bundle: true,
    external: ['obsidian'],
    format: 'cjs',
    target: 'es2018',
    logLevel: 'info',
    sourcemap: !isProd,
    treeShaking: true,
    outfile: 'dist/main.js',
    platform: 'node',
    mainFields: ['browser', 'module', 'main']
});

if (isProd) {
    await ctx.rebuild();
    process.exit(0);
} else {
    await ctx.watch();
} 