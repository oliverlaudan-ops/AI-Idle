import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// Exercise the real lazy-loader functions without booting the whole game.
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const start = source.indexOf('let aiLabLoading = false;');
const loader = source.slice(start, source.indexOf('// Start optimized game loops', start));

function setup(accept) {
    let click;
    const scripts = [];
    const status = { textContent: '' };
    const content = { innerHTML: '' };
    const confirm = vi.fn(accept);
    const document = {
        querySelector: () => ({ addEventListener: (_event, handler) => { click = handler; } }),
        getElementById: (id) => id === 'tensorflow-loader'
            ? { getAttribute: () => 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js' }
            : id === 'ai-lab-status' ? status : content,
        createElement: () => ({}),
        head: { appendChild: (script) => scripts.push(script) }
    };
    new Function('document', 'window', 'console', loader + '\nsetupAILabLazyLoad();')(
        document, { confirm }, { log: () => {}, error: () => {} }
    );
    return { click: () => click(), scripts, confirm, content };
}

describe('optional AI Lab privacy', () => {
    it('makes no CDN request before consent and remains retryable after refusal', async () => {
        let accepted = false;
        const lab = setup(() => accepted);
        expect(lab.scripts).toHaveLength(0);
        await lab.click();
        expect(lab.scripts).toHaveLength(0);
        expect(lab.confirm).toHaveBeenCalledWith(expect.stringContaining('IP address'));
        accepted = true;
        const pending = lab.click();
        expect(lab.scripts).toHaveLength(1);
        expect(lab.scripts[0].src).toContain('cdn.jsdelivr.net');
        await lab.click();
        expect(lab.scripts).toHaveLength(1);
        lab.scripts[0].onerror();
        await pending;
        expect(lab.content.innerHTML).toContain('Failed to load RL Bot');
    });

    it('allows retrying after a failed external load', async () => {
        const lab = setup(() => true);
        const first = lab.click();
        lab.scripts[0].onerror();
        await first;
        const second = lab.click();
        expect(lab.scripts).toHaveLength(2);
        lab.scripts[1].onerror();
        await second;
    });
});
