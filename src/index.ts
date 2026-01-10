const ROBOTS_TXT = `Disallow: /
`;

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>404 - Not Found</title>
	<link rel="stylesheet" href="/styles.css" />
</head>
<body>
	<main class="flex-1 container mx-auto px-4 py-8 max-w-7xl">
		<div class="hero min-h-[50vh] bg-base-200 rounded-box mb-8">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">404</h1>
				<p class="text-xl mt-4 mb-4">Page not found</p>
				<a href="/" class="btn btn-primary">Go home</a>
			</div>
		</div>
		</div>
	</main>
</body>
</html>`;

const getContentType = (path: string): string => {
	const extension = path.split('.').pop()?.toLowerCase();
	const contentTypes: Record<string, string> = {
		html: 'text/html; charset=utf-8',
		css: 'text/css; charset=utf-8',
		js: 'application/javascript; charset=utf-8',
		json: 'application/json; charset=utf-8',
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		webp: 'image/webp',
		ico: 'image/x-icon',
		txt: 'text/plain; charset=utf-8',
		xml: 'application/xml; charset=utf-8',
		pdf: 'application/pdf',
		woff: 'font/woff',
		woff2: 'font/woff2',
		ttf: 'font/ttf',
		otf: 'font/otf',
	};
	return contentTypes[extension || ''] || 'application/octet-stream';
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		let path = url.pathname;

		if (path === '/robots.txt') {
			return new Response(ROBOTS_TXT, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
				},
			});
		}

		if (path.endsWith('/')) {
			path = `${path}index.html`;
		}

		path = path.startsWith('/') ? path.slice(1) : path;

		try {
			const object = await env.BLOG_CONTENT.get(path);

			if (object === null) {
				return new Response(NOT_FOUND_HTML, {
					status: 404,
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
					},
				});
			}

			const headers = new Headers();
			headers.set('Content-Type', getContentType(path));

			if (object.httpMetadata?.contentType) {
				headers.set('Content-Type', object.httpMetadata.contentType);
			}
			if (object.httpMetadata?.cacheControl) {
				headers.set('Cache-Control', object.httpMetadata.cacheControl);
			}

			return new Response(object.body, {
				headers,
			});
		} catch (error) {
			console.error('Error fetching from R2:', error);
			return new Response(NOT_FOUND_HTML, {
				status: 404,
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;
