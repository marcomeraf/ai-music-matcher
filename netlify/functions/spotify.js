const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

// Generi VALIDI per Spotify Recommendations API - ESPANSI per maggiore varietà
const spotifyValidGenres = {
  electronic: [
    'house', 'techno', 'electronic', 'edm', 'trance', 'dubstep', 'drum-and-bass',
    'electro', 'progressive-house', 'deep-house', 'tech-house', 'minimal-techno',
    'ambient-house', 'breakbeat', 'garage', 'uk-garage', 'future-bass',
    'trap', 'hardstyle', 'psytrance', 'downtempo', 'trip-hop', 'idm',
    'synthwave', 'vaporwave', 'chillwave', 'electronica', 'glitch'
  ],
  
  pop: [
    'pop', 'dance-pop', 'electropop', 'synth-pop', 'indie-pop', 'art-pop',
    'power-pop', 'teen-pop', 'europop', 'k-pop', 'j-pop', 'mandopop',
    'cantopop', 'latin-pop', 'pop-rock', 'pop-punk', 'bubblegum-pop',
    'chamber-pop', 'dream-pop', 'noise-pop', 'jangle-pop', 'baroque-pop'
  ],
  
  rock: [
    'rock', 'indie-rock', 'alternative', 'classic-rock', 'hard-rock',
    'punk-rock', 'pop-rock', 'folk-rock', 'psychedelic-rock', 'progressive-rock',
    'garage-rock', 'blues-rock', 'southern-rock', 'surf-rock', 'grunge',
    'post-rock', 'math-rock', 'shoegaze', 'britpop', 'madchester',
    'new-wave', 'post-punk', 'punk', 'hardcore', 'emo', 'screamo'
  ],
  
  'hip-hop': [
    'hip-hop', 'rap', 'trap', 'old-school-hip-hop', 'east-coast-hip-hop',
    'west-coast-hip-hop', 'southern-hip-hop', 'gangsta-rap', 'conscious-hip-hop',
    'alternative-hip-hop', 'experimental-hip-hop', 'jazz-rap', 'boom-bap',
    'mumble-rap', 'drill', 'grime', 'uk-hip-hop', 'french-hip-hop',
    'german-hip-hop', 'crunk', 'hyphy', 'cloud-rap', 'lo-fi-hip-hop'
  ],
  
  jazz: [
    'jazz', 'blues', 'smooth-jazz', 'bebop', 'cool-jazz', 'hard-bop',
    'free-jazz', 'fusion', 'latin-jazz', 'swing', 'big-band', 'ragtime',
    'dixieland', 'contemporary-jazz', 'jazz-funk', 'acid-jazz', 'nu-jazz',
    'jazz-blues', 'vocal-jazz', 'gypsy-jazz', 'avant-garde-jazz', 'post-bop'
  ],
  
  classical: [
    'classical', 'piano', 'violin', 'cello', 'orchestra', 'chamber-music',
    'baroque', 'romantic', 'modern-classical', 'contemporary-classical',
    'minimalism', 'opera', 'choral', 'symphony', 'concerto', 'sonata',
    'string-quartet', 'early-music', 'renaissance', 'medieval', 'neoclassical'
  ],
  
  indie: [
    'indie', 'indie-pop', 'indie-rock', 'indie-folk', 'lo-fi', 'bedroom-pop',
    'indie-electronic', 'indie-dance', 'indie-punk', 'indie-r-n-b',
    'anti-folk', 'freak-folk', 'new-weird-america', 'psych-folk',
    'chamber-folk', 'folk-punk', 'acoustic', 'singer-songwriter'
  ],
  
  metal: [
    'metal', 'heavy-metal', 'death-metal', 'black-metal', 'thrash-metal',
    'power-metal', 'progressive-metal', 'doom-metal', 'sludge-metal',
    'stoner-metal', 'nu-metal', 'metalcore', 'deathcore', 'post-metal',
    'symphonic-metal', 'folk-metal', 'viking-metal', 'industrial-metal',
    'gothic-metal', 'alternative-metal', 'groove-metal', 'speed-metal'
  ],
  
  reggae: [
    'reggae', 'ska', 'dub', 'dancehall', 'roots-reggae', 'lovers-rock',
    'reggae-fusion', 'ska-punk', 'two-tone', 'rocksteady', 'mento',
    'reggaeton', 'moombahton', 'tropical-house', 'caribbean', 'calypso',
    'soca', 'zouk', 'kompa'
  ],
  
  country: [
    'country', 'folk', 'americana', 'bluegrass', 'alt-country', 'outlaw-country',
    'country-rock', 'honky-tonk', 'western', 'cowboy', 'nashville-sound',
    'bakersfield-sound', 'country-pop', 'contemporary-country', 'red-dirt',
    'texas-country', 'cajun', 'zydeco', 'appalachian', 'old-time'
  ],
  
  latin: [
    'latin', 'salsa', 'bachata', 'merengue', 'cumbia', 'reggaeton', 'tango',
    'bossa-nova', 'samba', 'forro', 'mpb', 'nueva-cancion', 'bolero',
    'mambo', 'cha-cha', 'son', 'rumba', 'flamenco', 'mariachi',
    'ranchera', 'norteño', 'banda', 'vallenato', 'tropicalia'
  ],
  
  ambient: [
    'ambient', 'chill', 'new-age', 'meditation', 'healing', 'nature-sounds',
    'drone', 'dark-ambient', 'space-ambient', 'psybient', 'chillout',
    'lounge', 'downtempo', 'trip-hop', 'nu-jazz', 'acid-jazz',
    'future-jazz', 'liquid-funk', 'atmospheric', 'cinematic', 'neoclassical'
  ],
  
  // Nuove categorie aggiunte
  funk: [
    'funk', 'p-funk', 'funk-rock', 'funk-metal', 'afrobeat', 'go-go',
    'minneapolis-funk', 'g-funk', 'funk-carioca', 'boogie', 'disco-funk'
  ],
  
  soul: [
    'soul', 'r-n-b', 'neo-soul', 'northern-soul', 'southern-soul',
    'deep-soul', 'blue-eyed-soul', 'psychedelic-soul', 'funk-soul',
    'contemporary-r-n-b', 'alternative-r-n-b'
  ],
  
  disco: [
    'disco', 'nu-disco', 'italo-disco', 'euro-disco', 'space-disco',
    'cosmic-disco', 'disco-house', 'disco-funk', 'disco-pop', 'boogie'
  ],
  
  world: [
    'world-music', 'african', 'indian', 'middle-eastern', 'celtic',
    'balkan', 'klezmer', 'gamelan', 'qawwali', 'fado', 'chanson',
    'bossa-nova', 'highlife', 'soukous', 'mbalax', 'rai'
  ],
  
  experimental: [
    'experimental', 'avant-garde', 'noise', 'industrial', 'post-industrial',
    'power-electronics', 'harsh-noise', 'drone', 'musique-concrete',
    'electroacoustic', 'sound-art', 'field-recording'
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
    
    // STRATEGIA 1: Recommendations API con parametri flessibili
    try {
      console.log('📡 Tentativo 1: Recommendations API...');
      
      const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams({
        seed_genres: validGenres.slice(0, 3).join(','), // Max 3 seed genres per più varietà
        limit: 50,
        min_valence: Math.max(0, parseFloat(audioFeatures.valence) - 0.3),
        max_valence: Math.min(1, parseFloat(audioFeatures.valence) + 0.3),
        min_energy: Math.max(0, parseFloat(audioFeatures.energy) - 0.3),
        max_energy: Math.min(1, parseFloat(audioFeatures.energy) + 0.3),
        min_popularity: 10 // Più permissivo
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
    
    // STRATEGIA 2: Recommendations API più permissiva (solo generi)
    if (tracks.length === 0) {
      console.log('📡 Tentativo 2: Recommendations API permissiva...');
      
      try {
        const permissiveUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams({
          seed_genres: validGenres.slice(0, 5).join(','), // Usa più generi
          limit: 50,
          min_popularity: 1 // Molto permissivo
        })}`;
        
        const permissiveResponse = await fetch(permissiveUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (permissiveResponse.ok) {
          const permissiveData = await permissiveResponse.json();
          console.log(`🎵 Recommendations permissive trovate: ${permissiveData.tracks?.length || 0}`);
          
          if (permissiveData.tracks && permissiveData.tracks.length > 0) {
            tracks = permissiveData.tracks.map(track => ({
              name: track.name,
              artist: track.artists[0].name,
              url: track.external_urls.spotify,
              image: track.album.images[1]?.url || track.album.images[0]?.url,
              popularity: track.popularity,
              id: track.id,
              source: 'recommendations-permissive'
            }));
            console.log(`✅ SUCCESSO con Recommendations permissive: ${tracks.length} canzoni`);
          }
        }
      } catch (error) {
        console.log('❌ Recommendations permissive error:', error.message);
      }
    }
    
    // STRATEGIA 3: Search API con query multiple e creative
    if (tracks.length === 0) {
      console.log('📡 Tentativo 3: Search API con query multiple...');
      
      // Query più creative e variate
      const searchQueries = [
        `genre:"${selectedGenre}" year:2020-2024`,
        `genre:"${validGenres[0]}" year:2015-2024`,
        `genre:"${validGenres[1] || validGenres[0]}" year:2010-2024`,
        `"${selectedGenre}" popular`,
        `"${validGenres[0]}" trending`,
        `"${validGenres[1] || validGenres[0]}" hits`,
        selectedGenre,
        validGenres[0],
        validGenres[1] || validGenres[0],
        `${answers.mood} ${selectedGenre}`,
        `${answers.activity} music`,
        'popular music 2024',
        'trending songs',
        'top hits'
      ];
      
      for (const query of searchQueries.slice(0, 8)) { // Prova max 8 query
        try {
          console.log(`🔍 Cercando: "${query}"`);
          
          const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`;
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
    
    // STRATEGIA 4: Search ultra-generico (ultimo resort)
    if (tracks.length === 0) {
      console.log('📡 Tentativo 4: Search ultra-generico...');
      
      const ultraGenericQueries = [
        'popular music',
        'top songs',
        'music',
        'hits',
        'songs',
        'a' // Cerca letteralmente "a" - dovrebbe trovare migliaia di risultati
      ];
      
      for (const query of ultraGenericQueries) {
        try {
          console.log(`🔍 Ultra-generic search: "${query}"`);
          
          const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`;
          const searchResponse = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.tracks.items.length > 0) {
              tracks = searchData.tracks.items.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                url: track.external_urls.spotify,
                image: track.album.images[1]?.url || track.album.images[0]?.url,
                popularity: track.popularity,
                id: track.id,
                source: `ultra-generic-${query}`
              }));
              console.log(`✅ Ultra-generic "${query}": ${tracks.length} canzoni`);
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Ultra-generic "${query}" error:`, error.message);
          continue;
        }
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
