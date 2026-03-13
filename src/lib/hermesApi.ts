import https from 'node:https';

const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function getBase(): string {
  const url = process.env.HERMES_API_URL ?? 'https://10.70.96.9/api';
  return url.endsWith('/') ? url : url + '/';
}

function hermesRequest(
  path: string,
  method: string,
  body?: string,
): Promise<{ data: unknown; status: number }> {
  const url = new URL(path, getBase());

  return new Promise((resolve) => {
    const headers: Record<string, string | number> = {
      'Content-Type': 'application/json',
    };
    if (body) headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers,
        agent: insecureAgent,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: string) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ data: JSON.parse(raw), status: res.statusCode ?? 200 });
          } catch {
            resolve({ data: { message: 'Invalid API response' }, status: 502 });
          }
        });
      },
    );

    req.on('error', () => {
      resolve({ data: { message: 'Could not reach the Hermes API.' }, status: 503 });
    });

    if (body) req.write(body);
    req.end();
  });
}

export const hermesGet = (path: string) => hermesRequest(path, 'GET');
export const hermesPost = (path: string, body: unknown) =>
  hermesRequest(path, 'POST', JSON.stringify(body));
