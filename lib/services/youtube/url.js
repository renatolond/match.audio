import { parse } from 'url';
import querystring from 'querystring';

export function* match(url, type) {
  const parsed = parse(url);
  if (parsed.host.match(/youtu\.be$/)) {
    return true;
  } else if (parsed.host.match(/youtube\.com$/)) {
    const query = querystring.parse(parsed.query);
    return !!query.v;
  }
  return false;
};
