import React, { useState, useEffect } from 'react';
import { Music, Brain, Heart, Play, RotateCcw, Sparkles, Headphones, ExternalLink, ChevronRight, List, ArrowLeft } from 'lucide-react';

const MusicMoodMatcher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [playlist, setPlaylist] = useState(null);
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const questions = [
    {
      id: 'mood',
      question: "Come ti senti?",
      subtitle: "Il tuo stato d'animo attuale",
      emoji: "😊",
      options: [
        { value: 'happy', label: 'Felice', subtitle: 'Energico e positivo', emoji: '😄' },
        { value: 'calm', label: 'Tranquillo', subtitle: 'Rilassato e sereno', emoji: '😌' },
        { value: 'melancholic', label: 'Pensieroso', subtitle: 'Riflessivo e malinconico', emoji: '🤔' },
        { value: 'motivated', label: 'Carico', subtitle: 'Motivato e determinato', emoji: '💪' },
        { value: 'nostalgic', label: 'Nostalgico', subtitle: 'Ricordi e emozioni del passato', emoji: '✨' }
      ]
    },

  // Funzione per verificare se una canzone appartiene al genere richiesto
  const checkGenreMatch = (track, requestedGenre) => {
    if (!requestedGenre) return true;
    
    const genreKeywords = {
      electronic: ['electronic', 'edm', 'house', 'techno', 'trance', 'dubstep', 'electro', 'synth'],
      pop: ['pop', 'mainstream', 'radio', 'chart', 'hit'],
      rock: ['rock', 'alternative', 'indie rock', 'guitar', 'grunge', 'punk'],
      'hip-hop': ['hip hop', 'rap', 'trap', 'urban', 'rnb', 'r&b'],
      jazz: ['jazz', 'smooth', 'bebop', 'fusion', 'blues', 'swing'],
      classical: ['classical', 'orchestra', 'piano', 'symphony', 'baroque', 'romantic'],
      indie: ['indie', 'independent', 'alternative', 'folk', 'bedroom'],
      metal: ['metal', 'heavy', 'death', 'black', 'metalcore', 'hardcore'],
      reggae: ['reggae', 'ska', 'dub', 'caribbean', 'dancehall'],
      country: ['country', 'folk', 'americana', 'bluegrass', 'western'],
      latin: ['latin', 'salsa', 'reggaeton', 'bossa', 'tango', 'mariachi'],
      ambient: ['ambient', 'chill', 'atmospheric', 'meditation', 'new age', 'drone']
    };
    
    const keywords = genreKeywords[requestedGenre] || [requestedGenre];
    
    // Controlla nel source (priorità massima)
    if (track.source && track.source.includes('genre') || track.source.includes('recommendations')) {
      return true; // Se viene da recommendations/genre-based, è già filtrato
    }
    
    // Controlla nei generi dell'artista
    if (track.genres && track.genres.length > 0) {
      const hasGenreMatch = track.genres.some(genre => 
        keywords.some(keyword => genre.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (hasGenreMatch) return true;
    }
    
    // Controlla nel nome della canzone e artista (fallback)
    const trackText = `${track.name} ${track.artist}`.toLowerCase();
    const hasTextMatch = keywords.some(keyword => 
      trackText.includes(keyword.toLowerCase())
    );
    
    return hasTextMatch;
  };
    {
      id: 'activity',
      question: "Cosa stai facendo?",
      subtitle: "La tua attività attuale o pianificata",
      emoji: "⚡",
      options: [
        { value: 'working', label: 'Focus', subtitle: 'Lavoro o studio', emoji: '💻' },
        { value: 'relaxing', label: 'Relax', subtitle: 'Momento di pausa', emoji: '🛋️' },
        { value: 'exercising', label: 'Sport', subtitle: 'Allenamento o movimento', emoji: '🏃‍♂️' },
        { value: 'partying', label: 'Party', subtitle: 'Festa o socializzazione', emoji: '🎉' },
        { value: 'walking', label: 'Viaggio', subtitle: 'Camminata o spostamento', emoji: '🚶‍♂️' }
      ]
    },
    {
      id: 'energy',
      question: "La tua energia?",
      subtitle: "Quanto ti senti attivo",
      emoji: "🔋",
      options: [
        { value: 'high', label: 'Massima', subtitle: 'Voglio ballare e muovermi', emoji: '🚀' },
        { value: 'medium', label: 'Bilanciata', subtitle: 'Ritmo moderato', emoji: '⚖️' },
        { value: 'low', label: 'Soft', subtitle: 'Qualcosa di delicato', emoji: '🕯️' },
        { value: 'variable', label: 'Mista', subtitle: 'Sorprendimi', emoji: '🎲' }
      ]
    },
    {
      id: 'time',
      question: "Che momento è?",
      subtitle: "Il tuo timing perfetto",
      emoji: "🕐",
      options: [
        { value: 'morning', label: 'Mattina', subtitle: 'Iniziare con energia', emoji: '🌅' },
        { value: 'afternoon', label: 'Pomeriggio', subtitle: 'Mantenere il ritmo', emoji: '☀️' },
        { value: 'evening', label: 'Sera', subtitle: 'Rallentare dolcemente', emoji: '🌅' },
        { value: 'night', label: 'Notte', subtitle: 'Atmosfera intima', emoji: '🌙' }
      ]
    },
    {
      id: 'genre',
      question: "Che genere?",
      subtitle: "Il tuo stile musicale oggi",
      emoji: "🎼",
      options: [
        { value: 'electronic', label: 'Electronic', subtitle: 'EDM, House, Techno', emoji: '🎛️' },
        { value: 'pop', label: 'Pop', subtitle: 'Mainstream e Radio Hits', emoji: '📻' },
        { value: 'rock', label: 'Rock', subtitle: 'Alternative, Indie, Classic', emoji: '🎸' },
        { value: 'hip-hop', label: 'Hip Hop', subtitle: 'Rap, R&B, Urban', emoji: '🎤' },
        { value: 'jazz', label: 'Jazz', subtitle: 'Smooth, Fusion, Blues', emoji: '🎷' },
        { value: 'classical', label: 'Classical', subtitle: 'Orchestra, Piano, Strings', emoji: '🎻' },
        { value: 'indie', label: 'Indie', subtitle: 'Alternative, Folk, Acoustic', emoji: '🎪' },
        { value: 'metal', label: 'Metal', subtitle: 'Heavy, Progressive, Alternative', emoji: '⚡' },
        { value: 'reggae', label: 'Reggae', subtitle: 'Dub, Ska, Caribbean', emoji: '🌴' },
        { value: 'country', label: 'Country', subtitle: 'Folk, Americana, Bluegrass', emoji: '🤠' },
        { value: 'latin', label: 'Latin', subtitle: 'Salsa, Reggaeton, Bossa Nova', emoji: '💃' },
        { value: 'ambient', label: 'Ambient', subtitle: 'Chill, Atmospheric, Lo-fi', emoji: '☁️' }
      ]
    }
  ];

  // Mapping intelligente basato sul mood e contesto
  const getMoodBasedTags = (answers) => {
    const tagMappings = {
      // Mood primario
      happy: ['upbeat', 'energetic', 'positive', 'dance', 'feel good', 'uplifting'],
      calm: ['chill', 'relaxing', 'peaceful', 'ambient', 'soft', 'meditation'],
      melancholic: ['melancholy', 'sad', 'emotional', 'indie', 'introspective', 'slow'],
      motivated: ['motivational', 'energetic', 'workout', 'powerful', 'driving', 'intense'],
      nostalgic: ['nostalgic', 'retro', 'classic', 'vintage', '80s', '90s'],

      // Attività
      working: ['focus', 'concentration', 'instrumental', 'productivity', 'ambient'],
      relaxing: ['chill', 'lounge', 'peaceful', 'soft', 'meditation'],
      exercising: ['workout', 'high energy', 'motivational', 'pump up', 'intense'],
      partying: ['party', 'dance', 'club', 'energetic', 'fun'],
      walking: ['travel', 'journey', 'atmospheric', 'cinematic'],

      // Energia
      high: ['high energy', 'intense', 'fast', 'powerful', 'energetic'],
      medium: ['moderate', 'balanced', 'steady', 'rhythmic'],
      low: ['slow', 'gentle', 'soft', 'calm', 'peaceful'],
      variable: ['dynamic', 'versatile', 'eclectic'],

      // Tempo del giorno
      morning: ['morning', 'fresh', 'awakening', 'positive', 'new day'],
      afternoon: ['sunny', 'bright', 'active', 'productive'],
      evening: ['sunset', 'golden hour', 'winding down', 'reflective'],
      night: ['night', 'dark', 'intimate', 'deep', 'atmospheric'],

      // Generi - ESPANSO con molti più generi
      electronic: ['electronic', 'techno', 'house', 'edm', 'synth', 'trance', 'dubstep'],
      pop: ['pop', 'mainstream', 'catchy', 'radio', 'top 40'],
      rock: ['rock', 'alternative', 'indie rock', 'guitar', 'grunge', 'punk'],
      'hip-hop': ['hip hop', 'rap', 'rnb', 'urban', 'trap', 'old school'],
      jazz: ['jazz', 'smooth jazz', 'bebop', 'fusion', 'blues', 'swing'],
      classical: ['classical', 'orchestra', 'piano', 'strings', 'baroque', 'romantic'],
      indie: ['indie', 'alternative', 'folk', 'acoustic', 'singer-songwriter', 'lo-fi'],
      metal: ['metal', 'heavy metal', 'progressive', 'death metal', 'black metal', 'metalcore'],
      reggae: ['reggae', 'dub', 'ska', 'caribbean', 'dancehall', 'roots'],
      country: ['country', 'folk', 'americana', 'bluegrass', 'western', 'honky tonk'],
      latin: ['latin', 'salsa', 'reggaeton', 'bossa nova', 'tango', 'mariachi'],
      ambient: ['ambient', 'experimental', 'atmospheric', 'soundscape', 'new age', 'drone']
    };

    let allTags = [];
    Object.keys(answers).forEach(key => {
      const answer = answers[key];
      if (tagMappings[answer]) {
        allTags = [...allTags, ...tagMappings[answer]];
      }
    });

    return [...new Set(allTags)].slice(0, 5);
  };

  // Chiamata alla Netlify Function
  const searchSpotify = async (tags) => {
    try {
      console.log(`🎵 Chiamando Netlify Function...`);
      console.log('📍 URL completo:', window.location.origin);
      
      const params = new URLSearchParams({
        mood: answers.mood || 'happy',
        activity: answers.activity || 'relaxing',
        energy: answers.energy || 'medium',
        time: answers.time || 'evening',
        genre: answers.genre || 'pop',
        tags: tags.join(',')
      });
      
      const apiUrl = `${window.location.origin}/.netlify/functions/spotify?${params}`;
      console.log('🔗 Chiamando:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📊 Response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Function error: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('📄 Response text (primi 200 char):', responseText.substring(0, 200));
      
      if (responseText.startsWith('<!DOCTYPE')) {
        throw new Error('Ricevuto HTML invece di JSON - Function non trovata');
      }
      
      const data = JSON.parse(responseText);
      
      if (data.tracks && data.tracks.length > 0) {
        console.log(`✅ Netlify Function: trovate ${data.tracks.length} canzoni`);
        return data.tracks.map(track => ({
          ...track,
          score: Math.random() * 100 + (track.popularity || 50)
        }));
      }
      
      console.log('⚠️ Nessuna canzone trovata dalla function');
      throw new Error('Nessuna canzone trovata');
      
    } catch (error) {
      console.error('Errore nella Netlify Function:', error);
      throw error; // Rilancia l'errore invece di usare fallback
    }
  };


  // Audio features
  const getAudioFeaturesFromMood = (answers) => {
    let valence = 0.5, energy = 0.5, danceability = 0.5, tempo = 120;
    
    switch (answers.mood) {
      case 'happy': valence = 0.8; energy = 0.7; danceability = 0.8; tempo = 128; break;
      case 'calm': valence = 0.6; energy = 0.3; danceability = 0.4; tempo = 80; break;
      case 'melancholic': valence = 0.2; energy = 0.4; danceability = 0.3; tempo = 85; break;
      case 'motivated': valence = 0.7; energy = 0.9; danceability = 0.6; tempo = 140; break;
      case 'nostalgic': valence = 0.5; energy = 0.5; danceability = 0.5; tempo = 110; break;
    }
    
    switch (answers.activity) {
      case 'exercising': energy = Math.min(1.0, energy + 0.3); tempo = Math.max(tempo, 130); break;
      case 'relaxing': energy = Math.max(0.1, energy - 0.4); tempo = Math.min(tempo, 90); break;
      case 'partying': energy = Math.min(1.0, energy + 0.2); danceability = Math.min(1.0, danceability + 0.3); break;
      case 'working': energy = Math.max(0.3, Math.min(0.7, energy)); danceability = Math.max(0.2, danceability - 0.2); break;
    }
    
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

  const generateExplanation = (track, answers, tags) => {
    const explanations = [];
    
    if (answers.mood === 'happy') {
      explanations.push("Ho scelto questa canzone perché emana energia positiva");
    } else if (answers.mood === 'calm') {
      explanations.push("Questa traccia ha un ritmo rilassante perfetto per il tuo momento");
    } else if (answers.mood === 'melancholic') {
      explanations.push("Una canzone che abbraccia i tuoi pensieri");
    } else if (answers.mood === 'motivated') {
      explanations.push("Un brano che amplificherà la tua motivazione");
    } else if (answers.mood === 'nostalgic') {
      explanations.push("Questa canzone evoca dolci ricordi");
    }

    if (answers.activity === 'working') {
      explanations.push("ideale per mantenere la concentrazione");
    } else if (answers.activity === 'exercising') {
      explanations.push("perfetta per accompagnare il movimento");
    } else if (answers.activity === 'partying') {
      explanations.push("che farà scatenare tutti");
    }

    return explanations.join(' e ') + '.';
  };

  const findBestMatch = async () => {
    try {
      const tags = getMoodBasedTags(answers);
      const tracks = await searchSpotify(tags);
      
      if (tracks.length === 0) {
        throw new Error('Nessuna canzone trovata');
      }

      // Algoritmo di scoring intelligente
      const scoredTracks = tracks.map(track => {
        let score = 0;
        
        // 1. FILTRO GENERE OBBLIGATORIO - Se non matcha il genere, score = 0
        const genreMatch = checkGenreMatch(track, answers.genre);
        if (!genreMatch) {
          return { ...track, score: 0 }; // Escludi completamente
        }
        
        // 2. PRIORITÀ SOURCE (peso maggiore)
        const sourceWeights = {
          'recommendations-enhanced': 100,
          'recommendations-basic': 80,
          'search-genre-specific': 90,
          'artist-based-recommendations': 85,
          'genre-based-recommendations': 75,
          'search-fallback': 40,
          'search-generic': 30
        };
        score += sourceWeights[track.source] || 50;
        
        // 3. BONUS GENERE MATCH (già verificato sopra)
        score += 50; // Bonus automatico per genere corretto
        
        // 4. MOOD COMPATIBILITY
        if (answers.mood === 'happy' && track.popularity > 60) score += 10;
        if (answers.mood === 'calm' && track.popularity < 70) score += 15;
        if (answers.mood === 'melancholic' && track.popularity < 60) score += 20;
        if (answers.mood === 'motivated' && track.popularity > 50) score += 10;
        
        // 5. ACTIVITY MATCH
        if (answers.activity === 'exercising' && track.popularity > 40) score += 8;
        if (answers.activity === 'relaxing' && track.popularity < 80) score += 12;
        if (answers.activity === 'working' && track.popularity > 30 && track.popularity < 90) score += 10;
        
        // 6. POPOLARITÀ (peso ridotto)
        score += (track.popularity || 0) * 0.15; // Molto meno peso alla popolarità
        
        // 7. PENALITÀ PER CANZONI TROPPO MAINSTREAM
        if (track.popularity > 85) score -= 20;
        
        // 8. BONUS DIVERSITÀ (per retry)
        if (retryCount > 0) {
          score += Math.random() * 30; // Aggiunge casualità nei retry
        }
        
        return { ...track, score };
      });
      
      // Filtra solo canzoni con score > 0 (genere corretto) e ordina
      const validTracks = scoredTracks.filter(track => track.score > 0);
      
      if (validTracks.length === 0) {
        throw new Error(`Nessuna canzone trovata per il genere "${answers.genre}"`);
      }
      
      validTracks.sort((a, b) => b.score - a.score);
      
      // Prendi la canzone con score più alto
      const selectedTrack = validTracks[0];
      
      // Log per debug del genere
      console.log(`🎯 Genere richiesto: ${answers.genre}`);
      console.log(`🎵 Canzone selezionata: "${selectedTrack.name}" by ${selectedTrack.artist}`);
      console.log(`📊 Source: ${selectedTrack.source}, Popularity: ${selectedTrack.popularity}`);
      
      const explanation = generateExplanation(selectedTrack, answers, tags);
      const audioFeatures = getAudioFeaturesFromMood(answers);
      const popularityScore = selectedTrack.popularity || 50;
      const confidence = Math.min(95, 70 + Math.floor(popularityScore / 5) + Math.floor(Math.random() * 15));

      console.log(`🎯 Canzone Spotify selezionata: "${selectedTrack.name}" di ${selectedTrack.artist}`);

      return {
        ...selectedTrack,
        reason: explanation,
        tags: tags,
        confidence: confidence,
        audioFeatures: audioFeatures
      };
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      throw error;
    }
  };

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsAnalyzing(true);
      setError(null);
      
      setTimeout(async () => {
        try {
          const match = await findBestMatch();
          setRecommendation(match);
          setIsAnalyzing(false);
          setShowResult(true);
        } catch (err) {
          setError('Qualcosa è andato storto. Riprova!');
          setIsAnalyzing(false);
        }
      }, 2500);
    }
  };

  const generatePlaylist = async () => {
    if (!recommendation) {
      setError('Nessuna canzone di base trovata');
      return;
    }
    
    console.log('🎵 === INIZIO GENERAZIONE PLAYLIST ===');
    console.log('🎯 Canzone base:', recommendation.name, 'by', recommendation.artist);
    console.log('🎼 Genere:', answers.genre);
    console.log('🎭 Answers:', answers);
    
    setIsGeneratingPlaylist(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'generate_playlist',
        trackId: recommendation.id || 'fallback',
        trackArtist: recommendation.artist,
        trackGenre: answers.genre || 'pop',
        mood: answers.mood || 'happy',
        activity: answers.activity || 'relaxing',
        energy: answers.energy || 'medium'
      });
      
      const apiUrl = `${window.location.origin}/.netlify/functions/spotify?${params}`;
      console.log('🔗 URL playlist:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Errore nella generazione: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('📄 Response text (primi 200 char):', responseText.substring(0, 200));
      
      const data = JSON.parse(responseText);
      console.log('📊 Data ricevuta:', data);
      
      if (data.playlist && data.playlist.length > 0) {
        setPlaylist(data.playlist);
        setShowPlaylist(true);
        console.log(`✅ PLAYLIST GENERATA CON SUCCESSO: ${data.playlist.length} canzoni`);
        
        // Log prime 3 canzoni per debug
        data.playlist.slice(0, 3).forEach((track, i) => {
          console.log(`🎵 ${i+1}. "${track.name}" by ${track.artist} (${track.source})`);
        });
      } else {
        console.error('❌ Playlist vuota o non trovata:', data);
        throw new Error(data.message || 'Nessuna canzone trovata per la playlist');
      }
      
    } catch (error) {
      console.error('❌ ERRORE GENERAZIONE PLAYLIST:', error);
      setError(`Errore nella generazione della playlist: ${error.message}`);
    } finally {
      setIsGeneratingPlaylist(false);
    }
  };

  const quickRetry = async () => {
    setIsAnalyzing(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    setTimeout(async () => {
      try {
        const tags = getMoodBasedTags(answers);
        const tracks = await searchSpotify(tags);
        
        if (tracks.length === 0) {
          throw new Error('Nessuna canzone trovata');
        }
        
        // Algoritmo di scoring con più casualità per il retry
        const scoredTracks = tracks.map(track => {
          let score = 0;
          
          const sourceWeights = {
            'recommendations-enhanced': 100,
            'recommendations-basic': 80,
            'search-genre-specific': 90,
            'artist-based-recommendations': 85,
            'genre-based-recommendations': 75,
            'search-fallback': 40,
            'search-generic': 30
          };
          score += sourceWeights[track.source] || 50;
          
          if (track.genres && track.genres.some(g => g.includes(answers.genre))) {
            score += 25;
          }
          
          // MAGGIORE CASUALITÀ NEL RETRY
          score += Math.random() * 50; // Più casualità
          score += (track.popularity || 0) * 0.1; // Ancora meno peso alla popolarità
          
          // Penalità per canzoni troppo mainstream
          if (track.popularity > 90) score -= 30;
          
          return { ...track, score };
        });
        
        scoredTracks.sort((a, b) => b.score - a.score);
        
        // Nel retry, prendi una delle top 5 invece che sempre la prima
        const topCandidates = scoredTracks.slice(0, 5);
        const randomIndex = Math.floor(Math.random() * topCandidates.length);
        const selectedTrack = topCandidates[randomIndex];
        
        const explanation = generateExplanation(selectedTrack, answers, tags);
        const audioFeatures = getAudioFeaturesFromMood(answers);
        const confidence = Math.min(95, 70 + Math.floor(selectedTrack.score / 10) + Math.floor(Math.random() * 15));

        const match = {
          ...selectedTrack,
          reason: explanation,
          tags: tags,
          confidence: confidence,
          audioFeatures: audioFeatures
        };
        
        setRecommendation(match);
        setIsAnalyzing(false);
      } catch (err) {
        setError('Qualcosa è andato storto. Riprova!');
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendation(null);
    setShowResult(false);
    setIsAnalyzing(false);
    setError(null);
    setRetryCount(0);
    setPlaylist(null);
    setShowPlaylist(false);
    setIsGeneratingPlaylist(false);
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(0,0,0,0.02),_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(0,0,0,0.02),_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-black mb-6 shadow-xl">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-4">
            Music Matcher
          </h1>
          <p className="text-xl text-gray-600 font-light">
            L'AI che trova la canzone perfetta per te
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Powered by Spotify API
          </div>
        </div>

        {!showResult && !isAnalyzing && !error && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-900">
                  {currentStep + 1} di {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-black h-1 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="text-center mb-10">
                <div className="text-7xl mb-6">{currentQuestion.emoji}</div>
                <h2 className="text-3xl font-light text-gray-900 mb-2">
                  {currentQuestion.question}
                </h2>
                <p className="text-gray-600 font-light">
                  {currentQuestion.subtitle}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="text-left">
                        <div className="text-lg font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-black rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 border-4 border-gray-600 rounded-full animate-ping opacity-40" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute inset-4 border-4 border-gray-400 rounded-full animate-ping opacity-60" style={{animationDelay: '0.4s'}}></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-black rounded-full animate-pulse"
                        style={{
                          height: `${12 + i * 8}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.6s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-black rounded-full animate-pulse"
                        style={{
                          height: `${28 - i * 8}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.8s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-light text-gray-900 mb-4">
                {retryCount === 0 ? 'Sto analizzando...' : 'Cerco un\'altra canzone...'}
              </h2>
              <p className="text-gray-600 font-light mb-6">
                {retryCount === 0 
                  ? 'Cerco la canzone perfetta per te su Spotify'
                  : 'Un momento, sto esplorando altre opzioni per te'
                }
              </p>
              <div className="text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <div className="mt-2 text-xs">Connesso a Spotify</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">
                Oops!
              </h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                Riprova
              </button>
            </div>
          </div>
        )}

        {showResult && recommendation && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 pb-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2">
                    La tua canzone
                  </h2>
                  <div className="text-sm text-gray-500">
                    Match: {recommendation.confidence}% • Powered by Spotify
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-6 mb-6">
                    {recommendation.image ? (
                      <img 
                        src={recommendation.image} 
                        alt={`${recommendation.name} cover`}
                        className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-20 h-20 rounded-2xl bg-black flex items-center justify-center shadow-sm ${recommendation.image ? 'hidden' : ''}`}>
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-medium text-gray-900 mb-1 truncate">
                        {recommendation.name}
                      </h3>
                      <p className="text-xl text-gray-600 mb-2 truncate">
                        {recommendation.artist}
                      </p>
                      <p className="text-sm text-gray-500">
                        {recommendation.popularity ? `${recommendation.popularity}% popularity` : 'Spotify Track'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 mb-6">
                    <p className="text-gray-700 font-light leading-relaxed">
                      {recommendation.reason}
                    </p>
                    
                    {recommendation.audioFeatures && (
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Energy:</span>
                          <span className="font-medium">{Math.round(recommendation.audioFeatures.energy * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Valence:</span>
                          <span className="font-medium">{Math.round(recommendation.audioFeatures.valence * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href={recommendation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium col-span-full"
                    >
                      <Play className="w-5 h-5" />
                      Apri su Spotify
                    </a>
                    <button
                      onClick={generatePlaylist}
                      disabled={isGeneratingPlaylist}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-xl transition-colors font-medium col-span-full"
                    >
                      {isGeneratingPlaylist ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <List className="w-5 h-5" />
                          Genera Playlist (15 canzoni)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={quickRetry}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl transition-colors font-medium"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Non mi piace, altra!
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-colors font-medium"
                  >
                    <Sparkles className="w-5 h-5" />
                    Nuovo quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPlaylist && playlist && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-light text-gray-900 mb-2">
                      La tua playlist
                    </h2>
                    <p className="text-gray-600">
                      {playlist.length} canzoni basate su "{recommendation.name}"
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Indietro
                  </button>
                </div>

                <div className="space-y-3">
                  {playlist.map((track, index) => (
                    <div key={`${track.id}-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      
                      {track.image ? (
                        <img 
                          src={track.image} 
                          alt={`${track.name} cover`}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center ${track.image ? 'hidden' : ''}`}>
                        <Music className="w-5 h-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {track.artist}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={generatePlaylist}
                      disabled={isGeneratingPlaylist}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-100 hover:bg-purple-200 disabled:bg-purple-50 text-purple-800 rounded-xl transition-colors font-medium"
                    >
                      {isGeneratingPlaylist ? (
                        <>
                          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5" />
                          Nuova Playlist
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-colors font-medium"
                    >
                      <Sparkles className="w-5 h-5" />
                      Nuovo Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicMoodMatcher;
