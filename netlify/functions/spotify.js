const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

// Generi VALIDI per Spotify Recommendations API
const spotifyValidGenres = {
  electronic: ['house', 'techno', 'electronic'],
  pop: ['pop', 'dance-pop'],
  rock: ['rock', 'indie-rock', 'alternative'],
  'hip-hop': ['hip-hop', 'rap'],
  jazz: ['jazz', 'blues'],
  classical: ['classical', 'piano'],
  indie: ['indie', 'indie-pop', 'folk'],
  metal: ['metal', 'hard-rock'],
  reggae: ['reggae', 'ska'],
  country: ['country', 'folk'],
  latin: ['latin', 'salsa'],
  ambient: ['chill', 'ambient', 'new-age']
};

// Semplice shuffle Fisher–Yates
const shuffleArray = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getAudioFeatures = (answers) => {
  let valence = 0.5, energy = 0.5, danceability = 0.5, tempo = 120;
  
  // Mood
  switch (answers.mood) {
    case 'happy':
      valence = 0.8; energy = 0.7; danceability = 0.8; tempo = 128;
      break;
    case 'calm':
      valence = 0.6; energy = 0.3; danceability = 0.4; tempo = 80;
      break;
    case 'melancholic':
      valence = 0.2; energy = 0.4; danceability = 0.3; tempo = 85;
      break;
    case 'motivated':
      valence = 0.7; energy = 0.9; danceability = 0.6; tempo = 140;
      break;
    case 'nostalgic':
      valence = 0.5; energy = 0.5; danceability = 0.5; tempo = 110;
      break;
    default:
      break;
  }
  
  // Activity
  switch (answers.activity) {
    case 'exercising':
      energy = Math.min(1, energy + 0.3);
      tempo = Math.max(tempo, 130);
      break;
    case 'relaxing':
      energy = Math.max(0.1, energy - 0.4);
      tempo = Math.min(tempo, 90);
      break;
    case 'partying':
      energy = Math.min(1, energy + 0.2);
      danceability = Math.min(1, danceability + 0.3);
      break;
    case 'working':
      energy = Math.max(0.3, Math.min(0.7, energy));
      danceability = Math.max(0.2, danceability - 0.2);
      break;
    default:
      break;
  }
  
  // Energy level
  switch (answers.energy) {
    case 'high':
      energy = Math.min(1, energy + 0.3);
      tempo = Math.max(tempo, 125);
      break;
    case 'low':
      energy = Math.max(0.1, energy - 0.3);
      tempo = Math.min(tempo, 95);
      break;
    case 'medium':
      energy = Math.max(0.4, Math.min(0.7, energy));
      break;
    default:
      break;
  }
  
  // Time of day
  switch (answers.time) {
    case 'morning':
      valence = Math.min(1, valence + 0.1);
      energy  = Math.min(1, energy  + 0.1);
      tempo   = Math.max(tempo, 100);
      break;
    case 'afternoon':
      valence = Math.min(1, valence + 0.05);
      energy  = Math.min(1, energy  + 0.05);
      tempo   = Math.max(tempo, 110);
      break;
    case 'evening':
      valence     = Math.min(1, valence + 0.2);
      energy      = Math.min(1, energy  + 0.2);
      danceability= Math.min(1, danceability + 0.1);
      tempo       = Math.max(tempo, 115);
      break;
    case 'night':
      energy = Math.min(1, energy + 0.3);
      tempo  = Math.max(tempo, 120);
      break;
    default:
      break;
  }
  
  return {
    valence: valence.toFixed(2),
    energy: energy.toFixed(2),
    danceability: danceability.toFixed(2),
    tempo: Math.round(tempo)
  };
};

exports.handler = async (event) => {
  try {
    console.log('🎵 === SPOTIFY FUNCTION ===');
    const answers = event.queryStringParameters || {};
    console.log('📥 Ricevuto:', answers);
    
    // 1) Token
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' +
          Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    if (!tokenRes.ok) throw new Error(`Token error ${tokenRes.status}`);
    const { access_token: token } = await tokenRes.json();
    
    // 2) Calcola features + genera seed genres randomizzati
    const audioFeatures   = getAudioFeatures(answers);
    const genreKey        = answers.genre || 'pop';
    const validGenres     = spotifyValidGenres[genreKey] || ['pop'];
    const seedGenres      = shuffleArray(validGenres).slice(0, 3);
    
    console.log(`🎯 Genere: ${genreKey}`, `🎼 Seeds: [${seedGenres.join(', ')}]`);
    console.log('🎵 AudioFeatures:', audioFeatures);
    
    let tracks = [];
    
    // 3) Recommendations API
    try {
      const params = new URLSearchParams({
        seed_genres: seedGenres.join(','),
        limit: '30',
        target_valence: audioFeatures.valence,
        target_energy: audioFeatures.energy,
        target_danceability: audioFeatures.danceability,
        target_tempo: audioFeatures.tempo,
        min_popularity: '20'
      });
      const url = `https://api.spotify.com/v1/recommendations?${params}`;
      console.log('🔗 Rec URL:', url);
      
      const recRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recRes.ok) {
        const { tracks: recData } = await recRes.json();
        console.log(`📊 Rec trovate: ${recData.length}`);
        if (recData.length) {
          // mescolo per avere un ordine diverso ad ogni chiamata
          const shuffled = shuffleArray(recData);
          tracks = shuffled.map(t => ({
            name:       t.name,
            artist:     t.artists[0].name,
            url:        t.external_urls.spotify,
            image:      t.album.images[1]?.url || t.album.images[0]?.url,
            popularity: t.popularity,
            id:         t.id,
            source:     'recommendations'
          }));
          console.log(`✅ Usate Recommendations API: ${tracks.length} canzoni`);
        }
      } else {
        console.warn('❌ Rec error', recRes.status, await recRes.text());
      }
    } catch (e) {
      console.warn('❌ Rec exception', e.message);
    }
    
    // 4) Search API (fallback)
    if (!tracks.length) {
      console.log('🔍 Fallback Search API');
      const queries = [
        `genre:"${genreKey}"`,
        validGenres[0],
        genreKey
      ];
      for (const q of queries) {
        try {
          const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=30`;
          const sr = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!sr.ok) continue;
          const items = (await sr.json()).tracks.items;
          if (items.length) {
            const shuffled = shuffleArray(items);
            tracks = shuffled.map(t => ({
              name:       t.name,
              artist:     t.artists[0].name,
              url:        t.external_urls.spotify,
              image:      t.album.images[1]?.url || t.album.images[0]?.url,
              popularity: t.popularity,
              id:         t.id,
              source:     `search-${q}`
            }));
            console.log(`✅ Trovate via Search "${q}": ${tracks.length}`);
            break;
          }
        } catch (e) {
          console.warn(`✴️ Search "${q}" error`, e.message);
        }
      }
    }
    
    // 5) Fallback generico
    if (!tracks.length) {
      const url = `https://api.spotify.com/v1/search?q=popular%20music&type=track&limit=20`;
      const sr = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sr.ok) {
        const items = (await sr.json()).tracks.items;
        tracks = items.map(t => ({
          name:       t.name,
          artist:     t.artists[0].name,
          url:        t.external_urls.spotify,
          image:      t.album.images[1]?.url || t.album.images[0]?.url,
          popularity: t.popularity,
          id:         t.id,
          source:     'fallback'
        }));
        console.log(`✅ Fallback generico: ${tracks.length}`);
      }
    }
    
    // 6) Unici
    const seen = new Set();
    const unique = [];
    for (const t of tracks) {
      const key = `${t.name.toLowerCase()}-${t.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(t);
      }
    }
    
    console.log('🎵 Fine, uniche:', unique.length, '→', unique[0]?.name);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        tracks: unique,
        audioFeatures,
        requestedGenre: genreKey
      })
    };
    
  } catch (err) {
    console.error('💥 ERRORE FINALE:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
