import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import { useMemo } from "react";

const markdown = new MarkdownIt({
	html: false,
	linkify: true,
	breaks: true,
	typographer: false,
});

const defaultLinkOpen =
	markdown.renderer.rules.link_open ??
	// biome-ignore lint/nursery/useMaxParams: markdown-it renderer rules use a fixed five-argument signature
	((tokens, index, options, _environment, renderer) =>
		renderer.renderToken(tokens, index, options));

// biome-ignore lint/nursery/useMaxParams: markdown-it renderer rules use a fixed five-argument signature
markdown.renderer.rules.link_open = (
	tokens,
	index,
	options,
	environment,
	renderer
) => {
	tokens[index]?.attrSet("target", "_blank");
	tokens[index]?.attrSet("rel", "noreferrer noopener");
	return defaultLinkOpen(tokens, index, options, environment, renderer);
};

interface ChatMarkdownProps {
	readonly content: string;
}

/** Renders ACP text content as sanitized, editor-themed Markdown. */
export function ChatMarkdown({ content }: ChatMarkdownProps): JSX.Element {
	const html = useMemo(
		() =>
			DOMPurify.sanitize(markdown.render(content), {
				USE_PROFILES: { html: true },
			}),
		[content]
	);

	return (
		<div
			className="agent-chat-markdown prose"
			/* biome-ignore lint/security/noDangerouslySetInnerHtml: markdown-it disables raw HTML and DOMPurify sanitizes the generated markup. */
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
