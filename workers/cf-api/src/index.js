/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx) {
// 		return new Response("Hello Worker!");
// 	},
// };

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

const corsHeaders = {
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Origin': '*',
};

async function handleRequest(request) {
	if(request.method === 'OPTIONS'){
		return new Response('OK', { headers: corsHeaders })
	}
	// get the endpoint from the url 
	const url = new URL(request.url);

	if(url.pathname == "/traffic-change"){		
		const value = await CF_API.get("traffic");
		return new Response(JSON.stringify(value), { 
			status: 200, 
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	} else if (url.pathname == "/popular-domains"){
		const value = await CF_API.get("domains");
		return new Response(JSON.stringify(value), { 
			status: 200, 
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	} else if (url.pathname == "/attack-layer3"){
		const value = await CF_API.get("attacks");
		return new Response(JSON.stringify(value), { 
			status: 200, 
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	}
	else {
		return new Response("Invalid Endpoint!", { status: 400 });
	}
}
