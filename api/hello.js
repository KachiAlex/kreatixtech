export const config = {
  runtime: 'edge'
};

export default function handler(request) {
  return new Response(JSON.stringify({ hello: true, url: request.url, timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
