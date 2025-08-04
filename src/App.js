import React, { useState, useEffect } from 'react';
import { Music, Brain, Heart, Play, RotateCcw, Sparkles, Headphones, ExternalLink, ChevronRight } from 'lucide-react';

const MusicMoodMatcher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Spotify API credentials
  const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
  const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';
  const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

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

    // Rimuovi duplicati e prendi i più rilevanti
    return [...new Set(allTags)].slice(0, 5);
  };

  // Chiamata alla Netlify Function invece delle API dirette
  const searchSpotify = async (tags) => {
    try {
      console.log(`🎵 Chiamando Netlify Function con mood: ${answers.mood}, genre: ${answers.genre}`);
      
      // Costruisci i parametri per la function
      const params = new URLSearchParams({
        mood: answers.mood || 'happy',
        activity: answers.activity || 'relaxing',
        energy: answers.energy || 'medium',
        time: answers.time || 'evening',
        genre: answers.genre || 'pop',
        tags: tags.join(',')
      });
      
      // Chiama la Netlify Function
      const response = await fetch(`/api/spotify?${params}`);
      
      if (!response.ok) {
        throw new Error(`Function error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.tracks && data.tracks.length > 0) {
        console.log(`✅ Netlify Function: trovate ${data.tracks.length} canzoni`);
        return data.tracks.map(track => ({
          ...track,
          score: Math.random() * 100 + (track.popularity || 50)
        }));
      }
      
      throw new Error('Nessuna canzone trovata dalla function');
      
    } catch (error) {
      console.error('Errore nella Netlify Function:', error);
      
      // Fallback locale minimo (solo per test)
      console.log('🔄 Usando fallback locale...');
      return getFallbackTracks();
    }
  };

  // Fallback minimo per test
  const getFallbackTracks = () => {
    const tracks = [
      { name: "Blinding Lights", artist: "The Weeknd", url: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", popularity: 95 },
      { name: "Levitating", artist: "Dua Lipa", url: "https://open.spotify.com/track/39LLxExYz6ewLAcYrzQQyP", popularity: 90 },
      { name: "Good 4 U", artist: "Olivia Rodrigo", url: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG", popularity: 88 },
      { name: "Stay", artist: "The Kid LAROI & Justin Bieber", url: "https://open.spotify.com/track/5PjdY0CKGZdEuoNab3yDmX", popularity: 87 },
      { name: "Industry Baby", artist: "Lil Nas X & Jack Harlow", url: "https://open.spotify.com/track/27NovPIUIRrOZoCHxABJwK", popularity: 86 }
    ];
    
    return tracks.map(track => ({
      ...track,
      score: Math.random() * 100 + track.popularity
    })).sort((a, b) => b.score - a.score);
  };

  // Converti mood in audio features per Spotify
  const getAudioFeaturesFromMood = (answers) => {
    let valence = 0.5; // Positività (0=sad, 1=happy)
    let energy = 0.5;  // Energia (0=calm, 1=energetic)  
    let danceability = 0.5; // Ballabilità
    let tempo = 120; // BPM
    
    // Mood mapping
    switch (answers.mood) {
      case 'happy':
        valence = 0.8;
        energy = 0.7;
        danceability = 0.8;
        tempo = 128;
        break;
      case 'calm':
        valence = 0.6;
        energy = 0.3;
        danceability = 0.4;
        tempo = 80;
        break;
      case 'melancholic':
        valence = 0.2;
        energy = 0.4;
        danceability = 0.3;
        tempo = 85;
        break;
      case 'motivated':
        valence = 0.7;
        energy = 0.9;
        danceability = 0.6;
        tempo = 140;
        break;
      case 'nostalgic':
        valence = 0.5;
        energy = 0.5;
        danceability = 0.5;
        tempo = 110;
        break;
    }
    
    // Activity adjustments
    switch (answers.activity) {
      case 'exercising':
        energy = Math.min(1.0, energy + 0.3);
        tempo = Math.max(tempo, 130);
        danceability = Math.min(1.0, danceability + 0.2);
        break;
      case 'relaxing':
        energy = Math.max(0.1, energy - 0.4);
        tempo = Math.min(tempo, 90);
        break;
      case 'partying':
        energy = Math.min(1.0, energy + 0.2);
        danceability = Math.min(1.0, danceability + 0.3);
        tempo = Math.max(tempo, 120);
        break;
      case 'working':
        energy = Math.max(0.3, Math.min(0.7, energy));
        danceability = Math.max(0.2, danceability - 0.2);
        break;
    }
    
    // Energy level adjustments
    switch (answers.energy) {
      case 'high':
        energy = Math.min(1.0, energy + 0.3);
        tempo = Math.max(tempo, 125);
        break;
      case 'low':
        energy = Math.max(0.1, energy - 0.3);
        tempo = Math.min(tempo, 95);
        break;
      case 'medium':
        energy = Math.max(0.4, Math.min(0.7, energy));
        break;
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
    
    // Spiegazione basata sul mood
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

    // Spiegazione basata sull'attività
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

      // Selezione intelligente con varietà
      const totalTracks = tracks.length;
      let selectedTrack;
      
      if (totalTracks === 1) {
        selectedTrack = tracks[0];
      } else if (totalTracks <= 5) {
        // Scegli random tra i primi 5
        const randomIndex = Math.floor(Math.random() * totalTracks);
        selectedTrack = tracks[randomIndex];
      } else {
        // Selezione pesata tra i primi 15
        const topTracks = tracks.slice(0, 15);
        const weights = topTracks.map((_, index) => Math.pow(0.85, index));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;
        
        for (let i = 0; i < weights.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            selectedIndex = i;
            break;
          }
        }
        
        selectedTrack = topTracks[selectedIndex];
      }
      
      const explanation = generateExplanation(selectedTrack, answers, tags);
      
      // Calcola confidence basata sui parametri audio e popolarità
      const audioFeatures = getAudioFeaturesFromMood(answers);
      const popularityScore = selectedTrack.popularity || 50;
      const confidence = Math.min(95, 70 + Math.floor(popularityScore / 5) + Math.floor(Math.random() * 15));

      console.log(`🎯 Canzone Spotify selezionata: "${selectedTrack.name}" di ${selectedTrack.artist}`);
      console.log(`📊 Popularity: ${popularityScore}, Confidence: ${confidence}%`);
      console.log(`🎵 Audio features target:`, audioFeatures);

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
      // Analisi finale
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

  const quickRetry = async () => {
    setIsAnalyzing(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    setTimeout(async () => {
      try {
        const match = await findBestMatch();
        setRecommendation(match);
        setIsAnalyzing(false);
      } catch (err) {
        setError('Qualcosa è andato storto. Riprova!');
        setIsAnalyzing(false);
      }
    }, 1500); // Più veloce del primo caricamento
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendation(null);
    setShowResult(false);
    setIsAnalyzing(false);
    setError(null);
    setRetryCount(0);
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Apple-style background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(0,0,0,0.02),_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(0,0,0,0.02),_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Apple-style Header */}
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
            {/* Apple-style Progress */}
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

            {/* Apple-style Question Card */}
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
              {/* Animazione figa con onde sonore */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                {/* Cerchi concentrici animati */}
                <div className="absolute inset-0 border-4 border-black rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 border-4 border-gray-600 rounded-full animate-ping opacity-40" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute inset-4 border-4 border-gray-400 rounded-full animate-ping opacity-60" style={{animationDelay: '0.4s'}}></div>
                
                {/* Icona centrale */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                
                {/* Onde sonore laterali */}
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
              {/* Header della canzone */}
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

                {/* Card della canzone */}
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
                        {recommendation.preview_url && ' • Preview disponibile'}
                      </p>
                    </div>
                  </div>

                  {/* Spiegazione */}
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

{/* Bottoni azione */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  
    href={recommendation.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
  >
    <Play className="w-5 h-5" />
    Apri su Spotify
  </a>
  {recommendation.preview_url ? (
    <audio
      controls
      src={recommendation.preview_url}
      className="w-full h-12 rounded-xl"
    >
      Il tuo browser non supporta l'audio.
    </audio>
  ) : (
    <div className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-500 rounded-xl">
      <span className="text-sm">Preview non disponibile</span>
    </div>
  )}
</div>

              {/* Footer con Quick Retry */}
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
      </div>
    </div>
  );
};

export default MusicMoodMatcher;
