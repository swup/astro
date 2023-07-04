export function buildInitScript(): string {
	// This gets injected into the user's page, so the import will pull
	// from the project's version of swup in their package.json.
	const options = '{}';
	const script = `
		import Swup from 'swup';
		const swup = new Swup(${options});
	`;
	return script.trim();
}
