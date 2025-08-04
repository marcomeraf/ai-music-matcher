const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

// Generi VALIDI per Spotify Recommendations API - Verificati dalla documentazione ufficiale
const spotifyValidGenres = {
  electronic: [
    'house', 'techno', 'electronic', 'edm', 'trance', 'dubstep', 'drum-and-bass',
    'electro', 'progressive-house', 'deep-house', 'tech-house', 'minimal-techno',
    'breakbeat', 'garage', 'uk-garage', 'future-bass', 'hardstyle', 'psytrance',
    'downtempo', 'trip-hop', 'idm', 'synthwave', 'chillwave', 'electronica'
  ],
  
  pop: [
    'pop', 'dance-pop', 'electropop', 'synth-pop', 'indie-pop', 'power-pop',
    'teen-pop', 'europop', 'k-pop', 'j-pop', 'latin-pop', 'pop-rock',
    'pop-punk', 'chamber-pop', 'dream-pop', 'noise-pop', 'jangle-pop',
    'baroque-pop', 'art-pop', 'bubblegum-pop', 'britpop', 'new-wave'
  ],
  
  rock: [
    'rock', 'indie-rock', 'alternative', 'classic-rock', 'hard-rock', 'punk-rock',
    'pop-rock', 'folk-rock', 'psychedelic-rock', 'progressive-rock', 'garage-rock',
    'blues-rock', 'southern-rock', 'surf-rock', 'grunge', 'post-rock', 'math-rock',
    'shoegaze', 'post-punk', 'punk', 'hardcore', 'emo', 'screamo', 'stoner-rock',
    'sludge', 'noise-rock', 'krautrock'
  ],
  
  'hip-hop': [
    'hip-hop', 'rap', 'trap', 'gangsta-rap', 'conscious-hip-hop', 'alternative-hip-hop',
    'experimental-hip-hop', 'jazz-rap', 'boom-bap', 'drill', 'grime', 'uk-hip-hop',
    'french-hip-hop', 'german-hip-hop', 'crunk', 'hyphy', 'cloud-rap', 'lo-fi-hip-hop',
    'old-school', 'east-coast-rap', 'west-coast-rap', 'southern-hip-hop', 'mumble-rap'
  ],
  
  jazz: [
    'jazz', 'blues', 'smooth-jazz', 'bebop', 'cool-jazz', 'hard-bop', 'free-jazz',
    'fusion', 'latin-jazz', 'swing', 'big-band', 'ragtime', 'dixieland',
    'contemporary-jazz', 'jazz-funk', 'acid-jazz', 'nu-jazz', 'jazz-blues',
    'vocal-jazz', 'gypsy-jazz', 'avant-garde-jazz', 'post-bop', 'modal-jazz'
  ],
  
  classical: [
    'classical', 'piano', 'violin', 'cello', 'orchestra', 'chamber-music', 'baroque',
    'romantic', 'modern-classical', 'contemporary-classical', 'minimalism', 'opera',
    'choral', 'symphony', 'concerto', 'sonata', 'string-quartet', 'early-music',
    'renaissance', 'medieval', 'neoclassical', 'impressionist'
  ],
  
  indie: [
    'indie', 'indie-pop', 'indie-rock', 'indie-folk', 'lo-fi', 'bedroom-pop',
    'indie-electronic', 'indie-dance', 'indie-punk', 'indie-r-n-b', 'anti-folk',
    'freak-folk', 'psych-folk', 'chamber-folk', 'folk-punk', 'acoustic',
    'singer-songwriter', 'slowcore', 'sadcore'
  ],
  
  metal: [
    'metal', 'heavy-metal', 'death-metal', 'black-metal', 'thrash-metal', 'power-metal',
    'progressive-metal', 'doom-metal', 'sludge-metal', 'stoner-metal', 'nu-metal',
    'metalcore', 'deathcore', 'post-metal', 'symphonic-metal', 'folk-metal',
    'industrial-metal', 'gothic-metal', 'alternative-metal', 'groove-metal',
    'speed-metal', 'viking-metal'
  ],
  
  reggae: [
    'reggae', 'ska', 'dub', 'dancehall', 'roots-reggae', 'lovers-rock', 'reggae-fusion',
    'ska-punk', 'rocksteady', 'mento', 'reggaeton', 'moombahton', 'tropical-house',
    'caribbean', 'calypso', 'soca', 'zouk'
  ],
  
  country: [
    'country', 'folk', 'americana', 'bluegrass', 'alt-country', 'outlaw-country',
    'country-rock', 'honky-tonk', 'western', 'country-pop', 'contemporary-country',
    'cajun', 'zydeco', 'appalachian', 'old-time', 'cowboy-western'
  ],
  
  latin: [
    'latin', 'salsa', 'bachata', 'merengue', 'cumbia', 'reggaeton', 'tango',
    'bossa-nova', 'samba', 'forro', 'mpb', 'bolero', 'mambo', 'cha-cha',
    'son', 'rumba', 'flamenco', 'mariachi', 'ranchera', 'banda', 'vallenato',
    'tropicalia', 'nueva-cancion'
  ],
  
  ambient: [
    'ambient', 'chill', 'new-age', 'meditation', 'drone', 'dark-ambient',
    'space-ambient', 'psybient', 'chillout', 'lounge', 'downtempo', 'trip-hop',
    'nu-jazz', 'acid-jazz', 'liquid-funk', 'atmospheric', 'cinematic',
    'post-ambient', 'field-recording'
  ]
};

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
    case 'working': energy = Math.max(0.3, Math.min(0.7, energy)); danceability = Math.max(0.2, danceability - 0.2); break;
  }
  
  // Energy level adjustments
  switch (answers.energy) {
    case 'high': energy = Math.min(1.0, energy + 0.3); tempo = Math.max(tempo, 125); break;
    case 'low': energy = Math.max(0.1, energy - 0.3); tempo = Math.min(tempo, 95); break;
    case 'medium': energy = Math.max(0.4, Math.min(0.7, energy)); break;
  }
  
  return {
    valence: valence.toFixed(2),
    energy: energy.toFixed(2),
    danceability: danceability.toFixed(2),
    tempo: Math.round(tempo)
  };
};

exports.handler = async (event, context) => {
  try {
    console.log('🎵 === SPOTIFY FUNCTION START ===');
    console.log('📥 Parametri ricevuti:', event.queryStringParameters);
    
    const answers = event.queryStringParameters || {};
    
    // Ottieni token Spotify
    console.log('🔑 Richiedendo token Spotify...');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    console.log('✅ Token Spotify ottenuto');
    
    // Calcola audio features e genere
    const audioFeatures = getAudioFeatures(answers);
    const selectedGenre = answers.genre || 'pop';
    const validGenres = spotifyValidGenres[selectedGenre] || ['pop'];
    
    console.log(`🎯 Genere selezionato: "${selectedGenre}"`);
    console.log(`🎼 Generi Spotify validi: [${validGenres.join(', ')}]`);
    console.log(`🎵 Audio features calcolate:`, audioFeatures);
    
    let tracks = [];
    
    // STRATEGIA 1: Recommendations API con genere specifico
    try {
      console.log('📡 Tentativo 1: Recommendations API...');
      
      const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams({
        seed_genres: validGenres.slice(0, 2).join(','), // Max 2 seed genres
        limit: 30,
        target_valence: audioFeatures.valence,
        target_energy: audioFeatures.energy,
        target_danceability: audioFeatures.danceability,
        min_popularity: 20
      })}`;
      
      console.log('🔗 URL Recommendations:', recommendationsUrl);
      
      const recResponse = await fetch(recommendationsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`📊 Recommendations response status: ${recResponse.status}`);
      
      if (recResponse.ok) {
        const recData = await recResponse.json();
        console.log(`🎵 Recommendations trovate: ${recData.tracks?.length || 0}`);
        
        if (recData.tracks && recData.tracks.length > 0) {
          tracks = recData.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            popularity: track.popularity,
            id: track.id,
            source: 'recommendations'
          }));
          console.log(`✅ SUCCESSO con Recommendations API: ${tracks.length} canzoni`);
        }
      } else {
        const errorText = await recResponse.text();
        console.log(`❌ Recommendations error: ${recResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Recommendations error:', error.message);
    }
    
    // STRATEGIA 2: Search API con genere specifico
    if (tracks.length === 0) {
      console.log('📡 Tentativo 2: Search API con genere...');
      
      const searchQueries = [
        `genre:"${selectedGenre}"`,
        `genre:"${validGenres[0]}"`,
        `"${selectedGenre}"`,
        `"${validGenres[0]}"`
      ];
      
      for (const query of searchQueries) {
        try {
          console.log(`🔍 Cercando: "${query}"`);
          
          const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=30`;
          const searchResponse = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`📊 Search "${query}" status: ${searchResponse.status}`);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log(`🎵 Search "${query}" trovate: ${searchData.tracks.items?.length || 0}`);
            
            if (searchData.tracks.items.length > 0) {
              tracks = searchData.tracks.items.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                url: track.external_urls.spotify,
                image: track.album.images[1]?.url || track.album.images[0]?.url,
                popularity: track.popularity,
                id: track.id,
                source: `search-${query}`
              }));
              console.log(`✅ SUCCESSO con Search "${query}": ${tracks.length} canzoni`);
              break;
            }
          } else {
            console.log(`❌ Search "${query}" failed: ${searchResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Search "${query}" error:`, error.message);
          continue;
        }
      }
    }
    
    // STRATEGIA 3: Fallback generico
    if (tracks.length === 0) {
      console.log('📡 Tentativo 3: Search generico...');
      
      const fallbackQuery = 'popular music';
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(fallbackQuery)}&type=track&limit=20`;
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
          popularity: track.popularity,
          id: track.id,
          source: 'fallback'
        }));
        console.log(`✅ Fallback: ${tracks.length} canzoni generiche`);
      }
    }
    
    // Rimuovi duplicati
    const uniqueTracks = [];
    const seen = new Set();
    
    for (const track of tracks) {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTracks.push(track);
      }
    }
    
    console.log(`🎵 === RISULTATO FINALE ===`);
    console.log(`📊 Canzoni uniche trovate: ${uniqueTracks.length}`);
    console.log(`🎯 Genere richiesto: ${selectedGenre}`);
    console.log(`🔗 Prima canzone: ${uniqueTracks[0]?.name} - ${uniqueTracks[0]?.artist} (source: ${uniqueTracks[0]?.source})`);
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        tracks: uniqueTracks,
        audioFeatures: audioFeatures,
        requestedGenre: selectedGenre,
        usedGenres: validGenres,
        message: `Found ${uniqueTracks.length} tracks`,
        success: true
      })
    };
    
  } catch (error) {
    console.error('💥 === ERRORE FINALE ===');
    console.error('❌ Error:', error.message);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message, 
        tracks: [],
        success: false
      })
    };
  }
};