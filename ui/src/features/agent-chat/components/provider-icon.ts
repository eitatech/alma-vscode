/**
 * provider-icon — maps a `providerId` (the stable id surfaced by the
 * extension's `AcpProviderRegistry`) to a VS Code codicon class.
 *
 * Why this exists: the redesign requested that the Provider chip on the
 * composer toolbar render only the agent icon (no text), Cursor-style.
 * codicons don't ship vendor logos so we approximate each agent with a
 * codicon that visually evokes its origin.
 *
 * The mapping covers all known agents in the catalog plus common
 * remote registry entries. If a provider id doesn't match any prefix
 * below, we fall back to `codicon-robot` so the chip is never empty.
 */

const PROVIDER_ICON_MAP: ReadonlyArray<readonly [RegExp, string]> = [
	// Anthropic / Claude family
	[/^claude/i, "codicon-comment-discussion"],
	// Google / Gemini family
	[/^gemini/i, "codicon-sparkle"],
	// OpenAI GPT / Codex / O-series
	[/^(gpt|openai|codex|o[1-9])/i, "codicon-chip"],
	// Alibaba / Qwen
	[/^qwen/i, "codicon-globe"],
	// Devin (Cognition)
	[/^devin/i, "codicon-account"],
	// Stakpak
	[/^stakpak/i, "codicon-server"],
	// F1rst Tecnologia (internal Santander/F1rst tooling)
	[/^f1rst/i, "codicon-flame"],
	// Aider
	[/^aider/i, "codicon-tools"],
	// Cline / Codename
	[/^cline/i, "codicon-terminal"],
	// Kimi (Moonshot AI)
	[/^kimi/i, "codicon-lightbulb"],
	// GitHub Copilot
	[/^(github-copilot|copilot)/i, "codicon-hubot"],
	// Mistral / Vibe
	[/^(mistral|vibe)/i, "codicon-wand"],
	// OpenCode
	[/^opencode/i, "codicon-code"],
	// JetBrains Junie
	[/^junie/i, "codicon-beaker"],
	// Amazon Q / AWS
	[/^(amazon-q|aws)/i, "codicon-cloud"],
	// Cursor
	[/^cursor/i, "codicon-target"],
	// Windsurf / Codeium
	[/^(windsurf|codeium)/i, "codicon-radio-tower"],
	// Zed
	[/^zed/i, "codicon-zap"],
	// Continue
	[/^continue/i, "codicon-play"],
	// Tabnine
	[/^tabnine/i, "codicon-keyboard"],
	// Sourcegraph Cody
	[/^(cody|sourcegraph)/i, "codicon-search"],
	// Replit
	[/^replit/i, "codicon-repl"],
	// Sweep
	[/^sweep/i, "codicon-trash"],
	// Bito
	[/^bito/i, "codicon-symbol-numeric"],
	// CodeGeeX
	[/^codegeex/i, "codicon-symbol-color"],
	// DeepSeek
	[/^deepseek/i, "codicon-telescope"],
	// Groq
	[/^groq/i, "codicon-circuit-board"],
	// Llama / Meta
	[/^(llama|meta)/i, "codicon-organization"],
	// Phind
	[/^phind/i, "codicon-search"],
	// Blackbox AI
	[/^blackbox/i, "codicon-package"],
	// Pieces
	[/^pieces/i, "codicon-extensions"],
	// Mentat
	[/^mentat/i, "codicon-pulse"],
	// Bloop
	[/^bloop/i, "codicon-sync"],
	// Snyk DeepCode
	[/^(snyk|deepcode)/i, "codicon-shield"],
	// Tabby
	[/^tabby/i, "codicon-symbol-keyword"],
	// PearAI
	[/^pear/i, "codicon-symbol-misc"],
	// Goose (Block)
	[/^goose/i, "codicon-rocket"],
	// Plandex
	[/^plandex/i, "codicon-calendar"],
	// OpenHands (formerly OpenDevin)
	[/^(openhands|opendevin)/i, "codicon-repl"],
	// SWE Agent
	[/^swe/i, "codicon-bug"],
	// AutoGPT
	[/^autogpt/i, "codicon-robot"],
	// GPT Engineer
	[/^gpt-engineer/i, "codicon-tools"],
	// Vercel AI / v0
	[/^(vercel|v0)/i, "codicon-triangle"],
	// Bolt
	[/^bolt/i, "codicon-zap"],
	// Databricks
	[/^databricks/i, "codicon-database"],
	// Hugging Face
	[/^hugging/i, "codicon-heart"],
	// LangChain
	[/^langchain/i, "codicon-link"],
	// CrewAI
	[/^crew/i, "codicon-organization"],
	// Vertex AI
	[/^vertex/i, "codicon-circuit-board"],
	// Azure AI
	[/^azure/i, "codicon-cloud"],
	// Watson
	[/^watson/i, "codicon-beaker"],
	// Salesforce Einstein
	[/^einstein/i, "codicon-lightbulb"],
];

export function providerIconClass(providerId: string): string {
	for (const [pattern, icon] of PROVIDER_ICON_MAP) {
		if (pattern.test(providerId)) {
			return icon;
		}
	}
	return "codicon-robot";
}
