import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

interface FormattedMessageProps {
  content: string;
  className?: string;
}

// Pre-process plain text to add markdown formatting
const preprocessContent = (text: string): string => {
  // Split into lines for processing
  const lines = text.split("\n");
  const processedLines = lines.map((line) => {
    // Skip empty lines
    if (!line.trim()) return line;

    // Detect section headers (lines ending with ":")
    const headerMatch = line.match(/^([A-Z][A-Za-z\s]+):$/);
    if (headerMatch) {
      return `\n### ${headerMatch[1]}\n`;
    }

    // Detect "Label: value" patterns and make label bold
    const labelValueMatch = line.match(/^([A-Z][A-Za-z\s\/\(\)]+):\s*(.+)$/);
    if (labelValueMatch) {
      const label = labelValueMatch[1].trim();
      let value = labelValueMatch[2].trim();

      // Format large numbers with commas (e.g., 2200000 -> 2,200,000)
      value = value.replace(/\b(\d{4,})\b/g, (match) => {
        return parseInt(match).toLocaleString();
      });

      // Auto-link URLs that aren't already linked
      value = value.replace(
        /(https?:\/\/[^\s]+)/g,
        (url) => `[${url}](${url})`
      );

      return `**${label}:** ${value}`;
    }

    // Auto-link standalone URLs
    const processedLine = line.replace(
      /(?<![(\[])(https?:\/\/[^\s\)]+)(?![)\]])/g,
      (url) => `[${url}](${url})`
    );

    return processedLine;
  });

  return processedLines.join("\n");
};

export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  content,
  className = "",
}) => {
  const processedContent = preprocessContent(content);

  return (
    <div
      className={`
        prose prose-sm dark:prose-invert max-w-none
        [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-4 [&>h3]:mb-2 [&>h3]:first:mt-0
        [&>p]:mb-1.5 [&>p:last-child]:mb-0
        [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/50 
        [&_a:hover]:decoration-primary [&_a]:transition-colors
        [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
        [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic
        ${className}
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 group"
            >
              <span className="break-all">{children}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          ),
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Style list items
          li: ({ children }) => (
            <li className="marker:text-primary/60">{children}</li>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
