import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const canonicalUrl = url.href.split('#')[0];
	return { canonicalUrl };
};
