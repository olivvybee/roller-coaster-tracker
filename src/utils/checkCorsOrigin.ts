export const checkCorsOrigin = (origin: string) => {
	if (origin.startsWith('http://localhost')) {
		return origin;
	}

	return '';
};
