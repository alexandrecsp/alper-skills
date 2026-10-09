#!/usr/bin/env node
/**
 * lint-skill.js
 *
 * Checks skills against the lint rules in ../references/skill-structure.md.
 * That file is the source of truth; when the two disagree, fix this one.
 *
 * Usage:
 *   node lint-skill.js [--json] <path> [<path> ...]
 *
 * Each <path> is a skill directory (holds a SKILL.md), a root whose child
 * directories are skills, or a plugin root (holds .claude-plugin/plugin.json),
 * which also lints agents/ and the plugin's <name>:<component> references.
 *
 * Exit codes: 0 = no errors, 1 = errors, 2 = bad usage.
 * No dependencies; Node 18+.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Contract ────────────────────────────────────────────────────────────────

const MAX_SKILL_LINES          = 500;
const MAX_NAME_LENGTH          = 64;
const MAX_DESCRIPTION          = 1024;
const MAX_USER_DESCRIPTION     = 200;
const MAX_OVERVIEW_LINES       = 5;

const ALLOWED_KEYS = new Set([
  'name', 'description', 'license', 'compatibility', 'metadata',
  'allowed-tools', 'disable-model-invocation', 'argument-hint',
]);

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const USE_WHEN   = /\buse (this skill |this )?when\b/i;
const NEGATED    = /\b(do not|don't|never) use (this skill |this )?when\b/gi;

// Accepted headings per section key.
const SECTIONS = {
  overview:         ['Overview'],
  whenToUse:        ['When to Use'],
  process:          ['Process', 'The Process', 'Core Process', 'Workflow', 'Steps'],
  rationalizations: ['Common Rationalizations'],
  redFlags:         ['Red Flags'],
  verification:     ['Verification'],
  routes:           ['Routes'],
};

const REQUIRED_BY_TYPE = {
  process:   ['overview', 'whenToUse', 'process', 'rationalizations', 'redFlags', 'verification'],
  reference: ['overview', 'whenToUse', 'verification'],
  router:    ['overview', 'routes'],
};

const HAS_TABLE    = body => /^\s*\|.*\|\s*$/m.test(body) && /^\s*\|[\s:|-]+\|\s*$/m.test(body);
const HAS_LIST     = body => /^\s*([-*+]|\d+\.)\s+\S/m.test(body);
const HAS_CHECKBOX = body => /^\s*[-*+]\s+\[[ xX]\]\s+\S/m.test(body);

// Body checks: [section, test, message, severity]
const BODY_CHECKS = [
  ['rationalizations', HAS_TABLE,    'must contain a markdown table (Rationalization | Reality)', 'error'],
  ['redFlags',         HAS_LIST,     'must contain a list of observable signs',                  'error'],
  ['verification',     HAS_CHECKBOX, 'must contain at least one "- [ ]" checkbox',               'error'],
  ['routes',           HAS_TABLE,    'must contain a markdown table (condition | skill)',        'error'],
];

// ─── Markdown helpers ────────────────────────────────────────────────────────

/** Blank out fenced code blocks and inline code so headings and links inside them are ignored. */
function stripCode(content) {
  const out = [];
  let fence = null;
  for (const line of content.split(/\r?\n/)) {
    if (fence) {
      if (new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`).test(line)) fence = null;
      out.push('');
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) { fence = open[1]; out.push(''); continue; }
    out.push(line.replace(/`[^`]*`/g, '``'));
  }
  return out.join('\n');
}

/** Split into { heading -> body } on level-2 headings. */
function h2Sections(content) {
  const sections = new Map();
  let current = null;
  for (const line of stripCode(content).split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m && !line.startsWith('###')) {
      current = m[1];
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    if (current) sections.get(current).push(line);
  }
  return new Map([...sections].map(([k, v]) => [k, v.join('\n')]));
}

/** Relative link targets, without fragments. */
function localLinks(content) {
  const links = [];
  const re = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  for (const m of stripCode(content).matchAll(re)) {
    const target = m[1];
    if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) continue;
    links.push(decodeURI(target.split('#')[0]));
  }
  return links.filter(Boolean);
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────

/**
 * Minimal YAML subset: top-level scalars, quoted scalars, block scalars (| >),
 * and one level of nested maps (for metadata). Returns null when absent.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/);
  if (!match) return null;

  const data = {};
  const lines = match[1].split(/\r?\n/);
  const unquote = v => v.replace(/^(['"])([\s\S]*)\1$/, '$2');

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;

    // Gather the continuation lines that belong to this key: indented lines,
    // blank lines, and (for an empty value) unindented "- item" list lines.
    const block = [];
    const continues = l => /^\s+\S/.test(l) || l.trim() === '' || (raw === '' && /^-\s/.test(l));
    while (i + 1 < lines.length && continues(lines[i + 1])) block.push(lines[++i]);
    while (block.length && block[block.length - 1].trim() === '') block.pop();

    if (/^\[.*\]$/.test(raw)) {
      data[key] = raw.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean);
    } else if (raw === '' && block.length && block.every(l => /^\s*-\s/.test(l) || l.trim() === '')) {
      data[key] = block.filter(l => l.trim()).map(l => unquote(l.replace(/^\s*-\s+/, '').trim()));
    } else if (/^[|>][+-]?$/.test(raw)) {
      const text = block.map(l => l.trim());
      data[key] = raw[0] === '|' ? text.join('\n') : text.join(' ').replace(/\s+/g, ' ');
    } else if (raw === '' && block.some(l => /^\s+[A-Za-z0-9_-]+\s*:/.test(l))) {
      const map = {};
      for (const l of block) {
        const sub = l.match(/^\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
        if (sub) map[sub[1]] = unquote(sub[2].trim());
      }
      data[key] = map;
    } else {
      // Plain scalars may wrap onto indented lines.
      data[key] = unquote([raw, ...block.map(l => l.trim())].join(' ').trim());
    }
  }
  return { data, endLine: match[0].split(/\r?\n/).length - 1 };
}

// ─── Lint ────────────────────────────────────────────────────────────────────

function listFiles(dir) {
  if (!fs.existsSync(dir)) return null;
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function lintSkill(skillDir) {
  const errors = [];
  const warnings = [];
  const dirName = path.basename(skillDir);
  const skillPath = path.join(skillDir, 'SKILL.md');
  const content = fs.readFileSync(skillPath, 'utf8');

  // Layout
  if (!KEBAB_CASE.test(dirName)) errors.push(`directory name '${dirName}' is not lowercase-hyphen-separated`);
  const lineCount = content.split(/\r?\n/).length;
  if (lineCount > MAX_SKILL_LINES) {
    errors.push(`SKILL.md has ${lineCount} lines (max ${MAX_SKILL_LINES}); disclose reference into references/`);
  }

  // Frontmatter
  const fm = parseFrontmatter(content);
  let type = null;
  if (!fm) {
    errors.push('missing YAML frontmatter (a --- block at the top of SKILL.md)');
  } else {
    const { data } = fm;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_KEYS.has(key)) errors.push(`frontmatter key '${key}' is not allowed; move runtime settings under 'metadata'`);
    }

    if (!data.name) errors.push("frontmatter is missing 'name'");
    else {
      if (!KEBAB_CASE.test(data.name)) errors.push(`name '${data.name}' is not kebab-case`);
      if (data.name.length > MAX_NAME_LENGTH) errors.push(`name is ${data.name.length} characters (max ${MAX_NAME_LENGTH})`);
      if (data.name !== dirName) errors.push(`name '${data.name}' does not match directory '${dirName}'`);
    }

    const userInvoked = String(data['disable-model-invocation']).toLowerCase() === 'true';
    const desc = typeof data.description === 'string' ? data.description : '';
    if (!desc) errors.push("frontmatter is missing 'description'");
    else if (userInvoked) {
      if (desc.length > MAX_USER_DESCRIPTION) {
        warnings.push(`user-invoked description is ${desc.length} characters (max ${MAX_USER_DESCRIPTION}); keep it a one-line human summary`);
      }
    } else {
      if (desc.length > MAX_DESCRIPTION) errors.push(`description is ${desc.length} characters (max ${MAX_DESCRIPTION})`);
      const affirmative = desc.replace(NEGATED, '');
      if (!USE_WHEN.test(affirmative)) errors.push('model-invoked description needs an affirmative "Use when …" trigger');
      if (/^\s*use (this skill |this )?when\b/i.test(desc)) warnings.push('description opens with "Use when"; lead with what the skill does');
    }

    const metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
    type = metadata.type || null;
    if (!type) errors.push(`missing 'metadata.type' (one of: ${Object.keys(REQUIRED_BY_TYPE).join(', ')})`);
    else if (!REQUIRED_BY_TYPE[type]) {
      errors.push(`unknown metadata.type '${type}' (one of: ${Object.keys(REQUIRED_BY_TYPE).join(', ')})`);
      type = null;
    }
  }

  // Sections
  const sections = h2Sections(content);
  const findSection = key => SECTIONS[key].find(h => sections.has(h));

  if (type) {
    const required = REQUIRED_BY_TYPE[type];
    for (const key of required) {
      if (!findSection(key)) errors.push(`${type} skill is missing section '## ${SECTIONS[key].join("' or '## ")}'`);
    }

    for (const [key, test, message, severity] of BODY_CHECKS) {
      if (!required.includes(key)) continue;
      const heading = findSection(key);
      if (heading && !test(sections.get(heading))) {
        (severity === 'error' ? errors : warnings).push(`'## ${heading}' ${message}`);
      }
    }

    if (type === 'reference') {
      const requiredHeadings = new Set(required.map(findSection));
      if (![...sections.keys()].some(h => !requiredHeadings.has(h))) {
        errors.push('reference skill has no body section beyond Overview, When to Use and Verification');
      }
    }
  }

  const overview = findSection('overview');
  if (overview) {
    const n = sections.get(overview).split('\n').filter(l => l.trim()).length;
    if (n > MAX_OVERVIEW_LINES) warnings.push(`'## Overview' has ${n} non-blank lines (max ${MAX_OVERVIEW_LINES}); state the defining constraint and stop`);
  }

  // Links and supporting files
  const checkLinks = (file, text) => {
    for (const link of localLinks(text)) {
      const target = path.resolve(path.dirname(file), link);
      if (!fs.existsSync(target)) {
        errors.push(`${path.relative(skillDir, file)}: broken link '${link}'`);
      }
    }
  };
  checkLinks(skillPath, content);

  const skillLinks = new Set(localLinks(content).map(l => path.resolve(skillDir, l)));
  const referencesDir = path.join(skillDir, 'references');
  const scriptsDir = path.join(skillDir, 'scripts');
  const refFiles = listFiles(referencesDir);
  const scriptFiles = listFiles(scriptsDir);

  if (refFiles && refFiles.length === 0) warnings.push('references/ is empty; remove it');
  if (scriptFiles && scriptFiles.length === 0) warnings.push('scripts/ is empty; remove it');

  const prose = [content];
  for (const file of refFiles || []) {
    const rel = path.relative(skillDir, file).split(path.sep).join('/');
    if (!skillLinks.has(file)) warnings.push(`${rel} is not linked from SKILL.md; the agent cannot reach it`);
    if (!file.endsWith('.md')) continue;

    const text = fs.readFileSync(file, 'utf8');
    prose.push(text);
    checkLinks(file, text);
    for (const link of localLinks(text)) {
      const target = path.resolve(path.dirname(file), link);
      if (target !== file && target.startsWith(referencesDir + path.sep) && target.endsWith('.md')) {
        warnings.push(`${rel} links to sibling reference '${link}'; keep disclosure one level deep from SKILL.md`);
      }
    }
  }

  const allProse = prose.join('\n');
  for (const file of scriptFiles || []) {
    if (!allProse.includes(path.basename(file))) {
      const rel = path.relative(skillDir, file).split(path.sep).join('/');
      warnings.push(`${rel} is not named in SKILL.md or any reference; the agent will not run it`);
    }
  }

  return { skill: dirName, path: skillDir, type, errors, warnings };
}

// ─── Agents (plugin mode) ────────────────────────────────────────────────────

const AGENT_MODELS = new Set(['sonnet', 'opus', 'haiku', 'fable', 'inherit']);
const AGENT_KEYS = new Set([
  'name', 'description', 'tools', 'disallowedTools', 'model', 'permissionMode',
  'maxTurns', 'skills', 'mcpServers', 'hooks', 'memory', 'background',
  'omitClaudeMd', 'effort', 'isolation', 'color', 'initialPrompt', 'experimental',
]);
const PLUGIN_IGNORED_AGENT_KEYS = new Set(['permissionMode', 'mcpServers', 'hooks', 'initialPrompt']);

/** skillsByName: Map name -> { userInvoked } for the plugin's skills. */
function lintAgent(file, skillsByName) {
  const errors = [];
  const warnings = [];
  const base = path.basename(file, '.md');
  const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));

  if (!fm) {
    errors.push('missing YAML frontmatter');
    return { skill: `agent:${base}`, path: file, type: 'agent', errors, warnings };
  }
  const { data } = fm;

  for (const key of Object.keys(data)) {
    if (!AGENT_KEYS.has(key)) warnings.push(`unknown agent field '${key}'; Claude Code ignores it silently`);
    else if (PLUGIN_IGNORED_AGENT_KEYS.has(key)) warnings.push(`'${key}' is ignored for plugin agents`);
  }

  if (!data.name) errors.push("missing 'name'");
  else {
    if (!KEBAB_CASE.test(data.name)) errors.push(`name '${data.name}' is not kebab-case`);
    if (data.name !== base) warnings.push(`name '${data.name}' does not match file name '${base}.md'`);
  }
  if (!data.description) errors.push("missing 'description'");

  if (!data.model) errors.push("missing 'model'; set it explicitly so cost is a decision, not a default");
  else if (!AGENT_MODELS.has(data.model) && !/^claude-/.test(data.model)) {
    errors.push(`model '${data.model}' is not one of ${[...AGENT_MODELS].join(', ')} or a claude-* model id`);
  }

  if (data.isolation && data.isolation !== 'worktree') errors.push(`isolation '${data.isolation}' is not 'worktree'`);

  const skills = Array.isArray(data.skills) ? data.skills : data.skills ? [data.skills] : [];
  for (const name of skills) {
    const skill = skillsByName.get(name);
    if (!skill) errors.push(`preloads skill '${name}', which is not in this plugin's skills/`);
    else if (skill.userInvoked) errors.push(`preloads skill '${name}', which has disable-model-invocation: true and cannot be preloaded`);
  }

  return { skill: `agent:${base}`, path: file, type: 'agent', errors, warnings };
}

/** Warn on `<plugin>:<name>` references in skills and agents that name nothing in the plugin. */
function checkPluginRefs(pluginName, files, known) {
  const re = new RegExp(`\\b${pluginName}:([a-z0-9]+(?:-[a-z0-9]+)*)`, 'g');
  for (const { file, result } of files) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(re)) {
      if (!known.has(m[1])) {
        result.warnings.push(`references '${pluginName}:${m[1]}', which is no skill or agent in this plugin`);
      }
    }
  }
}

function lintPlugin(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  const pluginName = manifest.name;
  const skillsDir = path.join(root, 'skills');
  const agentsDir = path.join(root, 'agents');

  const skillDirs = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md')))
        .map(e => path.join(skillsDir, e.name)).sort()
    : [];
  const agentFiles = fs.existsSync(agentsDir)
    ? fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).map(f => path.join(agentsDir, f)).sort()
    : [];

  const skillsByName = new Map();
  for (const dir of skillDirs) {
    const fm = parseFrontmatter(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'));
    const userInvoked = fm && String(fm.data['disable-model-invocation']).toLowerCase() === 'true';
    skillsByName.set(path.basename(dir), { userInvoked });
  }

  const skillResults = skillDirs.map(dir => ({ file: path.join(dir, 'SKILL.md'), result: lintSkill(dir) }));
  const agentResults = agentFiles.map(file => ({ file, result: lintAgent(file, skillsByName) }));

  const known = new Set([...skillsByName.keys(), ...agentFiles.map(f => path.basename(f, '.md'))]);
  checkPluginRefs(pluginName, [...skillResults, ...agentResults], known);

  return [...skillResults, ...agentResults].map(r => r.result);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function lintTarget(target) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    throw new Error(`not a directory: ${target}`);
  }
  if (fs.existsSync(path.join(abs, '.claude-plugin', 'plugin.json'))) return lintPlugin(abs);
  return collectSkillDirs(abs, target).map(lintSkill);
}

function collectSkillDirs(abs, target) {
  if (fs.existsSync(path.join(abs, 'SKILL.md'))) return [abs];
  const dirs = fs.readdirSync(abs, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(abs, e.name, 'SKILL.md')))
    .map(e => path.join(abs, e.name))
    .sort();
  if (dirs.length === 0) throw new Error(`no SKILL.md in ${target} or its child directories`);
  return dirs;
}

function main(argv) {
  const json = argv.includes('--json');
  const targets = argv.filter(a => a !== '--json');
  if (targets.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.error('Usage: node lint-skill.js [--json] <skill-dir | skills-root | plugin-root> [...]');
    return 2;
  }

  let results;
  try {
    results = targets.flatMap(lintTarget);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    return 2;
  }

  const errorCount = results.reduce((n, r) => n + r.errors.length, 0);
  const warningCount = results.reduce((n, r) => n + r.warnings.length, 0);

  if (json) {
    console.log(JSON.stringify({ errors: errorCount, warnings: warningCount, results }, null, 2));
  } else {
    for (const r of results) {
      const icon = r.errors.length ? '✗' : r.warnings.length ? '⚠' : '✓';
      console.log(`${icon} ${r.skill}${r.type ? ` (${r.type})` : ''}`);
      for (const msg of r.errors) console.log(`    ERROR: ${msg}`);
      for (const msg of r.warnings) console.log(`    WARN:  ${msg}`);
    }
    const status = errorCount ? 'FAILED' : warningCount ? 'PASSED WITH WARNINGS' : 'PASSED';
    console.log(`\n${results.length} skill(s) — ${errorCount} error(s), ${warningCount} warning(s) — ${status}`);
  }
  return errorCount ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { lintSkill, lintAgent, lintPlugin, parseFrontmatter, h2Sections, localLinks };
