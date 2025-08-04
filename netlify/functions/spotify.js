const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

// Generi VALIDI per Spotify Recommendations API con audio features specifiche
const genreProfiles = {
  electronic: {
    seeds: ['house', 'techno', 'electronic', 'edm', 'trance'],
    searchTerms: ['electronic music', 'EDM', 'house music', 'techno', 'trance', 'dubstep'],
    audioFeatures: {
      min_energy: 0.6,
      max_acousticness: 0.2,
      min_danceability: 0.6,
      min_tempo: 110,
      max_tempo: 140,
      max_instrumentalness: 0.8
    }
  },
  
  pop: {
    seeds: ['pop', 'dance-pop', 'electropop', 'indie-pop'],
    searchTerms: ['pop music', 'top hits', 'radio hits', 'mainstream pop'],
    audioFeatures: {
      min_energy: 0.4,
      max_energy: 0.9,
      min_danceability: 0.5,
      min_valence: 0.4,
      min_popularity: 40,
      min_tempo: 90,
      max_tempo: 130
    }
  },
  
  rock: {
    seeds: ['rock', 'indie-rock', 'alternative', 'classic-rock'],
    searchTerms: ['rock music', 'indie rock', 'alternative rock', 'guitar music'],
    audioFeatures: {
      min_energy: 0.5,
      max_acousticness: 0.4,
      min_loudness: -12,
      max_danceability: 0.7,
      min_tempo: 90,
      max_tempo: 150
    }
  },
  
  'hip-hop': {
    seeds: ['hip-hop', 'rap', 'trap'],
    searchTerms: ['hip hop', 'rap music', 'trap music', 'urban music'],
    audioFeatures: {
      min_energy: 0.6,
      min_speechiness: 0.3,
      min_danceability: 0.6,
      max_acousticness: 0.2,
      min_tempo: 70,
      max_tempo: 140
    }
  },
  
  jazz: {
    seeds: ['jazz', 'smooth-jazz', 'blues', 'swing'],
    searchTerms: ['jazz music', 'smooth jazz', 'jazz fusion', 'contemporary jazz'],
    audioFeatures: {
      min_acousticness: 0.3,
      max_danceability: 0.6,
      min_instrumentalness: 0.2,
      max_energy: 0.7,
      min_tempo: 60,
      max_tempo: 180
    }
  },
  
  classical: {
    seeds: ['classical', 'piano', 'orchestra'],
    searchTerms: ['classical music', 'orchestra', 'piano classical', 'symphony'],
    audioFeatures: {
      min_acousticness: 0.7,
      max_danceability: 0.3,
      min_instrumentalness: 0.5,
      max_energy: 0.6,
      max_loudness: -15,
      min_tempo: 60,
      max_tempo: 140
    }
  },
  
  indie: {
    seeds: ['indie', 'indie-pop', 'indie-rock', 'indie-folk'],
    searchTerms: ['indie music', 'independent music', 'indie folk', 'bedroom pop'],
    audioFeatures: {
      max_popularity: 70,
      min_acousticness: 0.2,
      max_danceability: 0.7,
      min_valence: 0.3,
      min_tempo: 80,
      max_tempo: 130
    }
  },
  
  metal: {
    seeds: ['metal', 'heavy-metal', 'death-metal', 'black-metal'],
    searchTerms: ['metal music', 'heavy metal', 'death metal', 'metalcore'],
    audioFeatures: {
      min_energy: 0.8,
      min_loudness: -8,
      max_acousticness: 0.1,
      max_danceability: 0.6,
      min_tempo: 120,
      max_tempo: 200
    }
  },
  
  reggae: {
    seeds: ['reggae', 'ska', 'dub'],
    searchTerms: ['reggae music', 'ska music', 'dub music', 'caribbean music'],
    audioFeatures: {
      min_danceability: 0.6,
      max_energy: 0.7,
      min_valence: 0.5,
      min_tempo: 60,
      max_tempo: 120
    }
  },
  
  country: {
    seeds: ['country', 'folk', 'americana', 'bluegrass'],
    searchTerms: ['country music', 'folk music', 'americana', 'country folk'],
    audioFeatures: {
      min_acousticness: 0.4,
      max_danceability: 0.7,
      min_valence: 0.4,
      min_tempo: 80,
      max_tempo: 140
    }
  },
  
  latin: {
    seeds: ['latin', 'salsa', 'reggaeton'],
    searchTerms: ['latin music', 'salsa music', 'reggaeton', 'latin pop'],
    audioFeatures: {
      min_danceability: 0.7,
      min_energy: 0.6,
      min_valence: 0.5,
      min_tempo: 90,
      max_tempo: 150
    }
  },
  
  ambient: {
    seeds: ['ambient', 'chill', 'new-age'],
    searchTerms: ['ambient music', 'chill music', 'atmospheric music', 'meditation music'],
    audioFeatures: {
      max_energy: 0.4,
      min_instrumentalness: 0.3,
      max_danceability: 0.4,
      max_loudness: -15,
      min_tempo: 60,
      max_tempo: 100
    }
  }
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

const buildRecommendationParams = (genreProfile, moodFeatures) => {
  const params = {
    seed_genres: genreProfile.seeds.slice(0, 2).join(','),
    limit: 30
  };
  
  // Combina audio features del genere con quelle del mood
  const combinedFeatures = { ...genreProfile.audioFeatures };
  
  // Applica mood adjustments mantenendo i vincoli del genere
  if (moodFeatures.valence) {
    if (!combinedFeatures.min_valence && !combinedFeatures.max_valence) {
      const valenceRange = 0.2;
      combinedFeatures.min_valence = Math.max(0, parseFloat(moodFeatures.valence) - valenceRange);
      combinedFeatures.max_valence = Math.min(1, parseFloat(moodFeatures.valence) + valenceRange);
    }
  }
  
  if (moodFeatures.energy) {
    const energyValue = parseFloat(moodFeatures.energy);
    if (combinedFeatures.min_energy) {
      combinedFeatures.min_energy = Math.max(combinedFeatures.min_energy, energyValue - 0.2);
    }
    if (combinedFeatures.max_energy) {
      combinedFeatures.max_energy = Math.min(combinedFeatures.max_energy, energyValue + 0.2);
    }
    if (!combinedFeatures.min_energy && !combinedFeatures.max_energy) {
      combinedFeatures.min_energy = Math.max(0, energyValue - 0.2);
      combinedFeatures.max_energy = Math.min(1, energyValue + 0.2);
    }
  }
  
  if (moodFeatures.danceability) {
    const danceValue = parseFloat(moodFeatures.danceability);
    if (combinedFeatures.min_danceability) {
      combinedFeatures.min_danceability = Math.max(combinedFeatures.min_danceability, danceValue - 0.2);
    }
    if (combinedFeatures.max_danceability) {
      combinedFeatures.max_danceability = Math.min(combinedFeatures.max_danceability, danceValue + 0.2);
    }
    if (!combinedFeatures.min_danceability && !combinedFeatures.max_danceability) {
      combinedFeatures.min_danceability = Math.max(0, danceValue - 0.2);
      combinedFeatures.max_danceability = Math.min(1, danceValue + 0.2);
    }
  }
  
  // Aggiungi tempo se specificato nel mood
  if (moodFeatures.tempo && !combinedFeatures.min_tempo && !combinedFeatures.max_tempo) {
    const tempoValue = parseInt(moodFeatures.tempo);
    combinedFeatures.min_tempo = Math.max(60, tempoValue - 20);
    combinedFeatures.max_tempo = Math.min(200, tempoValue + 20);
  }
  
  return { ...params, ...combinedFeatures };
};

// Nuova funzione per generare playlist basata su una canzone
const generatePlaylistFromTrack = async (token, trackId, trackArtist, trackGenre, answers) => {
  try {
    console.log(`🎵 Generando playlist basata su track ID: ${trackId}`);
    
    // Ottieni audio features della canzone base
    const audioFeaturesUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const audioResponse = await fetch(audioFeaturesUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let baseFeatures = {};
    if (audioResponse.ok) {
      const audioData = await audioResponse.json();
      baseFeatures = {
        target_energy: audioData.energy,
        target_valence: audioData.valence,
        target_danceability: audioData.danceability,
        target_acousticness: audioData.acousticness,
        target_tempo: audioData.tempo
      };
      console.log('🎼 Audio features della canzone base:', baseFeatures);
    }
    
    const genreProfile = genreProfiles[trackGenre] || genreProfiles['pop'];
    let playlistTracks = [];
    
    // STRATEGIA 1: Recommendations basate sulla canzone specifica
    try {
      const recParams = {
        seed_tracks: trackId,
        limit: 20,
        ...baseFeatures,
        // Aggiungi un po' di varietà
        min_popularity: 20
      };
      
      const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(recParams)}`;
      const recResponse = await fetch(recommendationsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (recResponse.ok) {
        const recData = await recResponse.json();
        if (recData.tracks && recData.tracks.length > 0) {
          playlistTracks = recData.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            popularity: track.popularity,
            id: track.id,
            source: 'track-based-recommendations'
          }));
          console.log(`✅ Track-based recommendations: ${playlistTracks.length} canzoni`);
        }
      }
    } catch (error) {
      console.log('❌ Track-based recommendations error:', error.message);
    }
    
    // STRATEGIA 2: Recommendations basate sull'artista
    if (playlistTracks.length < 15) {
      try {
        // Cerca l'artista per ottenere l'ID
        const artistSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackArtist)}&type=artist&limit=1`;
        const artistResponse = await fetch(artistSearchUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          if (artistData.artists.items.length > 0) {
            const artistId = artistData.artists.items[0].id;
            
            const artistRecParams = {
              seed_artists: artistId,
              seed_genres: genreProfile.seeds.slice(0, 1).join(','),
              limit: 15,
              min_popularity: 15
            };
            
            const artistRecUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(artistRecParams)}`;
            const artistRecResponse = await fetch(artistRecUrl, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (artistRecResponse.ok) {
              const artistRecData = await artistRecResponse.json();
              const artistTracks = artistRecData.tracks.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                url: track.external_urls.spotify,
                image: track.album.images[1]?.url || track.album.images[0]?.url,
                popularity: track.popularity,
                id: track.id,
                source: 'artist-based-recommendations'
              }));
              
              playlistTracks = [...playlistTracks, ...artistTracks];
              console.log(`✅ Artist-based recommendations: ${artistTracks.length} canzoni aggiunte`);
            }
          }
        }
      } catch (error) {
        console.log('❌ Artist-based recommendations error:', error.message);
      }
    }
    
    // STRATEGIA 3: Genre-based recommendations se ancora non abbiamo abbastanza
    if (playlistTracks.length < 15) {
      try {
        const genreRecParams = {
          seed_genres: genreProfile.seeds.slice(0, 2).join(','),
          limit: 20,
          ...genreProfile.audioFeatures,
          min_popularity: 10
        };
        
        const genreRecUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(genreRecParams)}`;
        const genreRecResponse = await fetch(genreRecUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (genreRecResponse.ok) {
          const genreRecData = await genreRecResponse.json();
          const genreTracks = genreRecData.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            popularity: track.popularity,
            id: track.id,
            source: 'genre-based-recommendations'
          }));
          
          playlistTracks = [...playlistTracks, ...genreTracks];
          console.log(`✅ Genre-based recommendations: ${genreTracks.length} canzoni aggiunte`);
        }
      } catch (error) {
        console.log('❌ Genre-based recommendations error:', error.message);
      }
    }
    
    // Rimuovi duplicati e la canzone originale
    const uniqueTracks = [];
    const seen = new Set();
    seen.add(trackId); // Escludi la canzone originale
    
    for (const track of playlistTracks) {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (!seen.has(key) && !seen.has(track.id) && track.popularity >= 5) {
        seen.add(key);
        seen.add(track.id);
        uniqueTracks.push(track);
      }
    }
    
    // Ordina per rilevanza e popolarità
    uniqueTracks.sort((a, b) => {
      const sourceWeight = {
        'track-based-recommendations': 100,
        'artist-based-recommendations': 80,
        'genre-based-recommendations': 60
      };
      
      const aWeight = sourceWeight[a.source] || 0;
      const bWeight = sourceWeight[b.source] || 0;
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    // Prendi le prime 15
    const finalPlaylist = uniqueTracks.slice(0, 15);
    
    console.log(`🎵 Playlist generata: ${finalPlaylist.length} canzoni`);
    return finalPlaylist;
    
  } catch (error) {
    console.error('❌ Errore nella generazione playlist:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  try {
    console.log('🎵 === SPOTIFY FUNCTION START (ENHANCED) ===');
    console.log('📥 Parametri ricevuti:', event.queryStringParameters);
    
    const answers = event.queryStringParameters || {};
    
    // Controlla se è una richiesta per generare playlist
    if (answers.action === 'generate_playlist') {
      console.log('🎵 === GENERAZIONE PLAYLIST ===');
      
      // Ottieni token Spotify
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
      
      const playlist = await generatePlaylistFromTrack(
        token,
        answers.trackId,
        answers.trackArtist,
        answers.trackGenre,
        answers
      );
      
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          playlist: playlist,
          message: `Generated playlist with ${playlist.length} tracks`,
          success: true
        })
      };
    }
    
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
    
    // Calcola audio features del mood
    const moodFeatures = getAudioFeatures(answers);
    const selectedGenre = answers.genre || 'pop';
    const genreProfile = genreProfiles[selectedGenre] || genreProfiles['pop'];
    
    console.log(`🎯 Genere selezionato: "${selectedGenre}"`);
    console.log(`🎼 Seeds disponibili: [${genreProfile.seeds.join(', ')}]`);
    console.log(`🎵 Audio features mood:`, moodFeatures);
    console.log(`🎸 Audio features genere:`, genreProfile.audioFeatures);
    
    let tracks = [];
    
    // STRATEGIA 1: Recommendations API con profilo genere + mood
    try {
      console.log('📡 Tentativo 1: Recommendations API Enhanced...');
      
      const recParams = buildRecommendationParams(genreProfile, moodFeatures);
      const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(recParams)}`;
      
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
            preview_url: track.preview_url,
            id: track.id,
            source: 'recommendations-enhanced'
          }));
          console.log(`✅ SUCCESSO con Recommendations Enhanced: ${tracks.length} canzoni`);
        }
      } else {
        const errorText = await recResponse.text();
        console.log(`❌ Recommendations error: ${recResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Recommendations Enhanced error:', error.message);
    }
    
    // STRATEGIA 2: Search API con termini specifici del genere
    if (tracks.length === 0) {
      console.log('📡 Tentativo 2: Search API con termini specifici...');
      
      for (const searchTerm of genreProfile.searchTerms) {
        try {
          console.log(`🔍 Cercando: "${searchTerm}"`);
          
          const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=30`;
          const searchResponse = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`📊 Search "${searchTerm}" status: ${searchResponse.status}`);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log(`🎵 Search "${searchTerm}" trovate: ${searchData.tracks.items?.length || 0}`);
            
            if (searchData.tracks.items.length > 0) {
              tracks = searchData.tracks.items.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                url: track.external_urls.spotify,
                image: track.album.images[1]?.url || track.album.images[0]?.url,
                popularity: track.popularity,
                preview_url: track.preview_url,
                id: track.id,
                source: `search-${searchTerm}`
              }));
              console.log(`✅ SUCCESSO con Search "${searchTerm}": ${tracks.length} canzoni`);
              break;
            }
          } else {
            console.log(`❌ Search "${searchTerm}" failed: ${searchResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Search "${searchTerm}" error:`, error.message);
          continue;
        }
      }
    }
    
    // STRATEGIA 3: Recommendations API base (fallback)
    if (tracks.length === 0) {
      console.log('📡 Tentativo 3: Recommendations API base...');
      
      const basicParams = {
        seed_genres: genreProfile.seeds.slice(0, 2).join(','),
        limit: 30,
        min_popularity: 20
      };
      
      const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(basicParams)}`;
      const recResponse = await fetch(recommendationsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (recResponse.ok) {
        const recData = await recResponse.json();
        if (recData.tracks && recData.tracks.length > 0) {
          tracks = recData.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            popularity: track.popularity,
            preview_url: track.preview_url,
            id: track.id,
            source: 'recommendations-basic'
          }));
          console.log(`✅ Fallback Recommendations: ${tracks.length} canzoni`);
        }
      }
    }
    
    // STRATEGIA 4: Search generico (ultimo fallback)
    if (tracks.length === 0) {
      console.log('📡 Tentativo 4: Search generico...');
      
      const fallbackQuery = `${selectedGenre} music`;
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
          preview_url: track.preview_url,
          id: track.id,
          source: 'search-generic'
        }));
        console.log(`✅ Search generico: ${tracks.length} canzoni`);
      }
    }
    
    // Rimuovi duplicati e filtra per qualità
    const uniqueTracks = [];
    const seen = new Set();
    
    for (const track of tracks) {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (!seen.has(key) && track.popularity >= 10) { // Minima qualità
        seen.add(key);
        uniqueTracks.push(track);
      }
    }
    
    // Ordina per popolarità e rilevanza
    uniqueTracks.sort((a, b) => {
      // Priorità per source (recommendations > search)
      const sourceWeight = {
        'recommendations-enhanced': 100,
        'recommendations-basic': 80,
        'search-specific': 60,
        'search-generic': 40
      };
      
      const aWeight = sourceWeight[a.source] || 0;
      const bWeight = sourceWeight[b.source] || 0;
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      
      // Poi per popolarità
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    console.log(`🎵 === RISULTATO FINALE ENHANCED ===`);
    console.log(`📊 Canzoni uniche trovate: ${uniqueTracks.length}`);
    console.log(`🎯 Genere richiesto: ${selectedGenre}`);
    console.log(`🎸 Profilo genere usato:`, genreProfile.audioFeatures);
    console.log(`🔗 Prima canzone: ${uniqueTracks[0]?.name} - ${uniqueTracks[0]?.artist} (source: ${uniqueTracks[0]?.source})`);
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        tracks: uniqueTracks,
        audioFeatures: moodFeatures,
        genreProfile: genreProfile.audioFeatures,
        requestedGenre: selectedGenre,
        usedSeeds: genreProfile.seeds,
        searchTerms: genreProfile.searchTerms,
        message: `Found ${uniqueTracks.length} tracks with enhanced genre precision`,
        success: true
      })
    };
    
  } catch (error) {
    console.error('💥 === ERRORE FINALE ENHANCED ===');
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