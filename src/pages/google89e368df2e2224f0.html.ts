// Google Search Console verification endpoint
export const GET = () => {
  return new Response('google-site-verification: google89e368df2e2224f0.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const prerender = true;
