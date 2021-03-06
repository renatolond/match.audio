import { parse } from 'url';
import bluebird from 'bluebird';
import PlayMusic from 'playmusic';
import { match as urlMatch }  from './url';

const pm = bluebird.promisifyAll(new PlayMusic());

export let id = 'google';

if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
  console.warn('GOOGLE_EMAIL or GOOGLE_PASSWORD environment variables not found, deactivating Google Play Music.');
}

let ready = pm.initAsync({email: process.env.GOOGLE_EMAIL, password: process.env.GOOGLE_PASSWORD}).catch(function(err) {
  console.log(err);
});

export const match = urlMatch;

export function* parseUrl(url) {
  yield ready;
  const parsed = parse(url.replace(/\+/g, '%20'));
  const path = parsed.path;
  const hash = parsed.hash;
  if (hash) {
    const parts = hash.split('/');
    const type = parts[1];
    const id = parts[2];
    const artist = decodeURIComponent(parts[3]);
    const album = decodeURIComponent(parts[4]);

    if (type !== 'album' && type !== 'track') {
      return false;
    }

    if (id.length > 0) {
      return {id: id, type: type};
    } else {
      return yield search({type: type, name: album, artist: {name: artist}});
    }
  } else if(path) {
    const matches = path.match(/\/music\/m\/([\w]+)/);
    const type = matches[1][0] === 'T' ? 'track' : 'album';
    return yield lookupId(matches[1], type);
  }
  return false;
};

export function* lookupId(id, type) {
  yield ready;
  if (type === 'album') {
    const album = yield pm.getAlbumAsync(id, false);
    return {
      service: 'google',
      type: 'album',
      id: album.albumId,
      name: album.name,
      streamUrl: 'https://play.google.com/music/m/' + album.albumId + '?signup_if_needed=1',
      purchaseUrl: 'https://play.google.com/store/music/album?id=' + album.albumId,
      artwork: {
        small: album.albumArtRef.replace('http:', 'https:'),
        large: album.albumArtRef.replace('http:', 'https:')
      },
      artist: {
        name: album.artist
      }
    };
  } else if (type === 'track') {
    const track = yield pm.getAllAccessTrackAsync(id);
    return {
      service: 'google',
      type: 'track',
      id: track.nid,
      name: track.title,
      streamUrl: 'https://play.google.com/music/m/' + track.nid + '?signup_if_needed=1',
      purchaseUrl: 'https://play.google.com/store/music/album?id=' + track.albumId,
      artwork: {
        small: track.albumArtRef[0].url.replace('http:', 'https:'),
        large: track.albumArtRef[0].url.replace('http:', 'https:')
      },
      album: {
        name: track.album
      },
      artist: {
        name: track.artist
      }
    };
  }
};

export function* search(data) {
  yield ready;
  let query, album;
  const type = data.type;

  if (type === 'album') {
    query = data.artist.name + ' ' + data.name;
    album = data.name;
  } else if (type === 'track') {
    query = data.artist.name + ' ' + data.album.name + ' ' + data.name;
    album = data.album.name;
  }

  let result = yield pm.searchAsync(query, 5)

  if (!result.entries) {
    const matches = album.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== album) {
      const cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = matches[0].trim();
      } else if (type === 'track') {
        cleanedData.album.name = matches[0].trim();
      }
      return yield search(cleanedData);
    } else {
      return {service: 'google'};
    }
  }
  result = result.entries.filter(function(entry) {
    return entry[type];
  }).sort(function(a, b) { // sort by match score
    return a.score < b.score;
  }).shift();

  if (!result) {
    return {service: 'google'};
  } else {
    if (type === 'album') {
      return yield lookupId(result.album.albumId, type);
    } else if (type === 'track') {
      return yield lookupId(result.track.nid, type);
    }
  }
};
