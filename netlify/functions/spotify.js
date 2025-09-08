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
    seed_genres: genreProfile.seeds.slice(0, 3).join(','),
    limit: 30
  };
  
  // Combina audio features del genere con quelle del mood
  const combinedFeatures = { ...genreProfile.audioFeatures };
  
  // Aumenta l'importanza del genere
  if (genreProfile.audioFeatures.min_popularity === undefined) {
    combinedFeatures.min_popularity = 20; // Assicura qualità minima
  }
  
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
    console.log(`🎵 === GENERAZIONE PLAYLIST ===`);
    console.log(`🎯 Track ID: ${trackId}`);
    console.log(`🎤 Artista: ${trackArtist}`);
    console.log(`🎼 Genere: ${trackGenre}`);
    console.log(`🎭 Mood: ${answers.mood}, Activity: ${answers.activity}, Energy: ${answers.energy}`);
    
    // Verifica parametri essenziali
    if (!trackId || trackId === 'fallback' || !trackArtist || !trackGenre) {
      console.log('⚠️ Parametri mancanti, uso solo genere per playlist');
    }
    
    // Ottieni audio features della canzone base
    let baseFeatures = {};
    
    if (trackId && trackId !== 'fallback') {
      try {
        const audioFeaturesUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;
        const audioResponse = await fetch(audioFeaturesUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (audioResponse.ok) {
          const audioData = await audioResponse.json();
          if (audioData && !audioData.error) {
            baseFeatures = {
              target_energy: audioData.energy,
              target_valence: audioData.valence,
              target_danceability: audioData.danceability,
              target_acousticness: audioData.acousticness,
              target_tempo: audioData.tempo
            };
            console.log('🎼 Audio features della canzone base:', baseFeatures);
          }
        }
      } catch (error) {
        console.log('⚠️ Errore audio features, continuo senza:', error.message);
      }
    }
    
    const genreProfile = genreProfiles[trackGenre] || genreProfiles['pop'];
    let playlistTracks = [];
    
    // STRATEGIA 1: Recommendations basate sulla canzone specifica
    if (trackId && trackId !== 'fallback' && Object.keys(baseFeatures).length > 0) {
      try {
        const recParams = {
          seed_tracks: trackId, 
          limit: 30,
          ...baseFeatures,
          min_popularity: 10
        };
        
        console.log('🎯 Parametri track-based:', recParams);
        const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(recParams)}`;
        const recResponse = await fetch(recommendationsUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (recResponse.ok) {
          const recData = await recResponse.json();
          console.log(`📊 Track-based response: ${recData.tracks?.length || 0} canzoni`);
          
          if (recData.tracks && recData.tracks.length > 0) {
            playlistTracks = recData.tracks
              .filter(track => !track.artists[0].name.toLowerCase().includes('hunter'))
              .map(track => ({
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
        } else {
          const errorText = await recResponse.text();
          console.log(`❌ Track-based error: ${recResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.log('❌ Track-based recommendations error:', error.message);
      }
    }
    
    // STRATEGIA 2: Recommendations basate sull'artista
    if (playlistTracks.length < 15 && trackArtist && !trackArtist.toLowerCase().includes('hunter')) {
      try {
        console.log('🎤 Tentativo artist-based...');
        // Cerca l'artista per ottenere l'ID
        const artistSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackArtist)}&type=artist&limit=1`;
        const artistResponse = await fetch(artistSearchUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          console.log(`🔍 Artist search: ${artistData.artists?.items?.length || 0} risultati`);
          
          if (artistData.artists.items.length > 0) {
            const artistId = artistData.artists.items[0].id;
            console.log(`🎤 Artist ID trovato: ${artistId}`);
            
            const artistRecParams = {
              seed_artists: artistId,
              seed_genres: genreProfile.seeds.slice(0, 2).join(','),
              limit: 25,
              min_popularity: 5
            };
            
            console.log('🎯 Parametri artist-based:', artistRecParams);
            const artistRecUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(artistRecParams)}`;
            const artistRecResponse = await fetch(artistRecUrl, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (artistRecResponse.ok) {
              const artistRecData = await artistRecResponse.json();
              console.log(`📊 Artist-based response: ${artistRecData.tracks?.length || 0} canzoni`);
              
              const artistTracks = artistRecData.tracks
                .filter(track => !track.artists[0].name.toLowerCase().includes('hunter'))
                .map(track => ({
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
            } else {
              const errorText = await artistRecResponse.text();
              console.log(`❌ Artist-based error: ${artistRecResponse.status} - ${errorText}`);
            }
          }
        } else {
          console.log(`❌ Artist search error: ${artistResponse.status}`);
        }
      } catch (error) {
        console.log('❌ Artist-based recommendations error:', error.message);
      }
    }
    
    // STRATEGIA 3: Genre-based recommendations se ancora non abbiamo abbastanza
    if (playlistTracks.length < 15) {
      try {
        console.log('🎼 Tentativo genre-based...');
        const genreRecParams = {
          seed_genres: genreProfile.seeds.slice(0, 3).join(','),
          limit: 30,
          ...genreProfile.audioFeatures,
          min_popularity: 1
        };
        
        console.log('🎯 Parametri genre-based:', genreRecParams);
        const genreRecUrl = `https://api.spotify.com/v1/recommendations?${new URLSearchParams(genreRecParams)}`;
        const genreRecResponse = await fetch(genreRecUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (genreRecResponse.ok) {
          const genreRecData = await genreRecResponse.json();
          console.log(`📊 Genre-based response: ${genreRecData.tracks?.length || 0} canzoni`);
          
          const genreTracks = genreRecData.tracks
            .filter(track => !track.artists[0].name.toLowerCase().includes('hunter'))
            .map(track => ({
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
        } else {
          const errorText = await genreRecResponse.text();
          console.log(`❌ Genre-based error: ${genreRecResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.log('❌ Genre-based recommendations error:', error.message);
      }
    }
    
    // STRATEGIA 4: Search fallback se ancora non abbiamo abbastanza
    if (playlistTracks.length < 10) {
      try {
        console.log('🔍 Tentativo search fallback...');
        const searchQuery = `genre:"${trackGenre}" year:2020-2024`;
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=30`;
        const searchResponse = await fetch(searchUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log(`📊 Search fallback response: ${searchData.tracks?.items?.length || 0} canzoni`);
          
          const searchTracks = searchData.tracks.items
            .filter(track => !track.artists[0].name.toLowerCase().includes('hunter'))
            .map(track => ({
              name: track.name,
              artist: track.artists[0].name,
              url: track.external_urls.spotify,
              image: track.album.images[1]?.url || track.album.images[0]?.url,
              popularity: track.popularity,
              id: track.id,
              source: 'search-fallback'
            }));
          
          playlistTracks = [...playlistTracks, ...searchTracks];
          console.log(`✅ Search fallback: ${searchTracks.length} canzoni aggiunte`);
        }
      } catch (error) {
        console.log('❌ Search fallback error:', error.message);
      }
    }
    
    // Rimuovi duplicati e la canzone originale
    const uniqueTracks = [];
    const seen = new Set();
    if (trackId && trackId !== 'fallback') {
      seen.add(trackId.toLowerCase()); // Escludi la canzone originale
    }
    
    for (const track of playlistTracks) {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (!seen.has(key) && !seen.has(track.id?.toLowerCase()) && 
          !track.artist.toLowerCase().includes('hunter')) {
        seen.add(key);
        if (track.id) seen.add(track.id.toLowerCase());
        uniqueTracks.push(track);
      }
    }
    
    // Ordina per rilevanza e popolarità
    uniqueTracks.sort((a, b) => {
      const sourceWeight = {
        'track-based-recommendations': 100,
        'artist-based-recommendations': 80,
        'genre-based-recommendations': 60,
        'search-fallback': 40
      };
      
      const aWeight = sourceWeight[a.source] || 0;
      const bWeight = sourceWeight[b.source] || 0;
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    // Prendi le prime 15
    const finalPlaylist = uniqueTracks.slice(0, 15);
    
    console.log(`🎵 === PLAYLIST FINALE ===`);
    console.log(`📊 Totale canzoni trovate: ${playlistTracks.length}`);
    console.log(`🔄 Canzoni uniche: ${uniqueTracks.length}`);
    console.log(`✅ Playlist finale: ${finalPlaylist.length} canzoni`);
    
    if (finalPlaylist.length > 0) {
      console.log(`🎵 Prima canzone playlist: "${finalPlaylist[0].name}" by ${finalPlaylist[0].artist}`);
    }
    
    return finalPlaylist;
    
  } catch (error) {
    console.error('❌ ERRORE GENERAZIONE PLAYLIST:', error);
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
      
      // FORZA il genere nelle recommendations
      recParams.seed_genres = genreProfile.seeds.slice(0, 5).join(','); // Usa TUTTI i seeds del genere
      recParams.min_popularity = 1; // Abbassa soglia per più varietà
      
      // Log per debug
      console.log('🎯 Parametri recommendations:', recParams);
      
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
            genres: track.artists.flatMap(artist => artist.genres || []), // Tutti i generi di tutti gli artisti
            source: 'recommendations-enhanced'
          }));
          console.log(`✅ SUCCESSO con Recommendations Enhanced: ${tracks.length} canzoni`);
          
          // Log delle prime 3 canzoni per debug
          tracks.slice(0, 3).forEach((track, i) => {
            console.log(`🎵 Track ${i+1}: "${track.name}" by ${track.artist} (pop: ${track.popularity}, genres: ${track.genres.join(', ')})`);
          });
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
      
      // Prova prima con i termini più specifici
      const priorityTerms = genreProfile.searchTerms.slice(0, 2);
      
      for (const searchTerm of priorityTerms) {
        try {
          console.log(`🔍 Cercando: "${searchTerm}"`);
          
          // Cerca SOLO con il genere specifico (più restrittivo)
          const genreQuery = `genre:"${selectedGenre}" ${searchTerm}`;
          const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genreQuery)}&type=track&limit=20`;
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
                genres: track.artists.flatMap(artist => artist.genres || []),
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
        seed_genres: genreProfile.seeds.slice(0, 3).join(','), // Più generi per varietà
        limit: 30,
        min_popularity: 1, // Popolarità minima per più varietà
        ...genreProfile.audioFeatures // Usa le caratteristiche del genere
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
            genres: track.artists.flatMap(artist => artist.genres || []),
            source: 'recommendations-basic'
          }));
          console.log(`✅ Fallback Recommendations: ${tracks.length} canzoni`);
        }
      }
    }
    
    // STRATEGIA 4: Search generico (ultimo fallback)
    if (tracks.length === 0) {
      console.log('📡 Tentativo 4: Search generico...');
      
      // Search MOLTO specifico per genere
      const fallbackQuery = `genre:"${selectedGenre}"`; // SOLO il genere, senza filtri anno
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
          genres: track.artists.flatMap(artist => artist.genres || []),
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
      if (!seen.has(key) && track.popularity >= 1 && 
          !track.artist.toLowerCase().includes('hunter')) { // Blocca HUNTER/X
        seen.add(key);
        uniqueTracks.push(track);
      }
    }
    
    // Ordina per rilevanza del genere e popolarità
    uniqueTracks.sort((a, b) => {
      // Priorità per source (recommendations > search)
      const sourceWeight = {
        'recommendations-enhanced': 100,
        'recommendations-basic': 80,
        'search-genre-specific': 90, // Nuovo peso alto per search con genere
        'search-generic': 40
      };
      
      let aWeight = sourceWeight[a.source] || 0;
      let bWeight = sourceWeight[b.source] || 0;
      
      // Bonus se il genere è nel nome dell'artista o nelle info
      if (a.genres && a.genres.some(g => g.includes(selectedGenre))) aWeight += 20;
      if (b.genres && b.genres.some(g => g.includes(selectedGenre))) bWeight += 20;
      
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