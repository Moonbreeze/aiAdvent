/**
 * Escapes special HTML characters to prevent injection and ensure correct rendering.
 * @param text - The text to escape.
 * @returns Escaped HTML string.
 */
export const escapeHtml = (text: string): string => {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
