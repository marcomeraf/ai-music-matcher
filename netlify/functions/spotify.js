const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

// Mappa generi
const spotifyGenres = {
  electronic: ['electronic', 'house', 'techno', 'edm'],
  pop: ['pop', 'dance-pop', 'electropop'],
  rock: ['rock', 'indie-rock', 'alternative-rock'],
  'hip-hop': ['hip-hop', 'rap', 'trap'],
  jazz: ['jazz', 'smooth-jazz', 'jazz-fusion'],
  classical: ['classical', 'piano', 'orchestral'],
  indie: ['indie', 'indie-pop', 'folk'],
  metal: ['metal', 'hard-rock', 'heavy-metal'],
  reggae: ['reggae', 'ska', 'dub'],
  country: ['country', 'folk', 'americana'],
  latin: ['latin', 'reggaeton', 'salsa'],
  ambient: ['ambient', 'chill', 'downtempo']
};

// Calcola audio features da mood
const getAudioFeatures = (answers) => {
  let valence = 0.5, energy = 0.5, danceability = 0.5, tempo = 120;
  
  // Mood mapping
  switch (answers.mood) {
    case 'happy': valence = 0.8; energy = 0.7; danceability = 0.8; tempo = 128; break;
    case 'calm': valence = 0.6; energy = 0.3; danceability = 0.4; tempo = 80; break;
    case 'melancholic': valence = 0.2; energy = 0.4; danceability = 0.3; tempo = 85; break;
    case 'motivated': valence = 0.7; energy = 0.9; danceability = 0.6; tempo = 140; break;
    case 'nostalgic': valence = 0.5; energy = 0.5; danceability = 0.5; tempo = 110; break;
  }
  
  // Activity adjustments
  switch (answers.activity) {
    case 'exercising': energy = Math.min(1.0, energy + 0.3); tempo = Math.max(tempo, 130); break;
    case 'relaxing': energy = Math.max(0.1, energy - 0.4); tempo = Math.min(tempo, 90); break;
    case 'partying': energy = Math.min(1.0, energy + 0.2); danceability = Math.min(1.0, danceability + 0.3); break;
  }
  
  return { valence: valence.toFixed(2), energy: energy.toFixed(2), danceability: danceability.toFixed(2), tempo: Math.round(tempo) };
};

exports.handler = async (event, context) => {
  try {
    const answers = event.queryStringParameters || {};
    
    // Get Spotify token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    
    // Get audio features and genre
    const audioFeatures = getAudioFeatures(answers);
    const mainGenre = answers.genre || 'pop';
    const seedGenres = spotifyGenres[mainGenre]?.slice(0, 2) || ['pop'];
    
    // Try Recommendations API
    const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams({
      seed_genres: seedGenres.join(','),
      limit: 30,
      target_valence: audioFeatures.valence,
      target_energy: audioFeatures.energy,
      target_danceability: audioFeatures.danceability,
      target_tempo: audioFeatures.tempo,
      min_popularity: 20
    })}`;
    
    const recResponse = await fetch(recommendationsUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let tracks = [];
    
    if (recResponse.ok) {
      const recData = await recResponse.json();
      if (recData.tracks && recData.tracks.length > 0) {
        tracks = recData.tracks.map(track => ({
          name: track.name,
          artist: track.artists[0].name,
          url: track.external_urls.spotify,
          image: track.album.images[1]?.url || track.album.images[0]?.url,
          preview_url: track.preview_url,
          popularity: track.popularity,
          id: track.id
        }));
      }
    }
    
    // Fallback to search if no recommendations
    if (tracks.length === 0) {
      const searchUrl = `https://api.spotify.com/v1/search?q=genre:"${mainGenre}"&type=track&limit=30`;
      const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        tracks = searchData.tracks.items.map(track => ({
          name: track.name,
          artist: track.artists[0].name,
          url: track.external_urls.spotify,
          image: track.album.images[1]?.url || track.album.images[0]?.url,
          preview_url: track.preview_url,
          popularity: track.popularity,
          id: track.id
        }));
      }
    }
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        tracks: tracks,
        audioFeatures: audioFeatures,
        message: `Found ${tracks.length} tracks for ${mainGenre} genre`
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message, tracks: [] })
    };
  }
};
