# PROMPT PERFETTO PER RICOSTRUIRE MUSIC MATCHER APP

## RICHIESTA PRINCIPALE
Crea un'applicazione web React chiamata "Music Matcher" che trova la canzone perfetta basandosi sul mood dell'utente tramite le API Spotify. L'app deve essere deployabile su Netlify con Netlify Functions.

## SPECIFICHE TECNICHE

### STACK TECNOLOGICO
- **Frontend**: React 18 con Create React App
- **Styling**: Tailwind CSS (tramite CDN)
- **Icons**: Lucide React
- **Backend**: Netlify Functions (Node.js)
- **API**: Spotify Web API (Client Credentials Flow)
- **Deploy**: Netlify

### CREDENZIALI SPOTIFY (da usare esattamente)
```
SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9'
SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71'
```

## FUNZIONALITÀ RICHIESTE

### 1. QUIZ INTERATTIVO (5 DOMANDE)
Crea un quiz con queste domande esatte:

**Domanda 1 - Mood:**
- Felice (😄): Energico e positivo
- Tranquillo (😌): Rilassato e sereno  
- Pensieroso (🤔): Riflessivo e malinconico
- Carico (💪): Motivato e determinato
- Nostalgico (✨): Ricordi e emozioni del passato

**Domanda 2 - Activity:**
- Focus (💻): Lavoro o studio
- Relax (🛋️): Momento di pausa
- Sport (🏃‍♂️): Allenamento o movimento
- Party (🎉): Festa o socializzazione
- Viaggio (🚶‍♂️): Camminata o spostamento

**Domanda 3 - Energy:**
- Massima (🚀): Voglio ballare e muovermi
- Bilanciata (⚖️): Ritmo moderato
- Soft (🕯️): Qualcosa di delicato
- Mista (🎲): Sorprendimi

**Domanda 4 - Time:**
- Mattina (🌅): Iniziare con energia
- Pomeriggio (☀️): Mantenere il ritmo
- Sera (🌅): Rallentare dolcemente
- Notte (🌙): Atmosfera intima

**Domanda 5 - Genre:**
- Electronic (🎛️): EDM, House, Techno
- Pop (📻): Mainstream e Radio Hits
- Rock (🎸): Alternative, Indie, Classic
- Hip Hop (🎤): Rap, R&B, Urban
- Jazz (🎷): Smooth, Fusion, Blues
- Classical (🎻): Orchestra, Piano, Strings
- Indie (🎪): Alternative, Folk, Acoustic
- Metal (⚡): Heavy, Progressive, Alternative
- Reggae (🌴): Dub, Ska, Caribbean
- Country (🤠): Folk, Americana, Bluegrass
- Latin (💃): Salsa, Reggaeton, Bossa Nova
- Ambient (☁️): Chill, Atmospheric, Lo-fi

### 2. ALGORITMO DI MATCHING INTELLIGENTE

#### MAPPING MOOD → AUDIO FEATURES
```javascript
happy: valence=0.8, energy=0.7, danceability=0.8, tempo=128
calm: valence=0.6, energy=0.3, danceability=0.4, tempo=80
melancholic: valence=0.2, energy=0.4, danceability=0.3, tempo=85
motivated: valence=0.7, energy=0.9, danceability=0.6, tempo=140
nostalgic: valence=0.5, energy=0.5, danceability=0.5, tempo=110
```

#### MODIFICATORI ACTIVITY
```javascript
exercising: energy+0.3, tempo=min(130)
relaxing: energy-0.4, tempo=max(90)
partying: energy+0.2, danceability+0.3
working: energy=0.3-0.7, danceability-0.2
```

#### PROFILI GENERE COMPLETI
Ogni genere deve avere:
- **seeds**: array di generi Spotify validi
- **searchTerms**: termini per search fallback
- **audioFeatures**: vincoli specifici (min_energy, max_acousticness, etc.)

Esempio Electronic:
```javascript
electronic: {
  seeds: ['house', 'techno', 'electronic', 'edm', 'trance'],
  searchTerms: ['electronic music', 'EDM', 'house music'],
  audioFeatures: {
    min_energy: 0.6,
    max_acousticness: 0.2,
    min_danceability: 0.6,
    min_tempo: 110,
    max_tempo: 140
  }
}
```

### 3. FILTRO GENERE OBBLIGATORIO
**CRITICO**: Il genere deve essere una discriminante obbligatoria. Implementa:
- Funzione `checkGenreMatch()` che verifica appartenenza al genere
- Score = 0 per canzoni che non matchano (escluse completamente)
- Errore specifico se nessuna canzone del genere viene trovata

### 4. STRATEGIA MULTI-LIVELLO SPOTIFY API

#### Backend (Netlify Function):
1. **Recommendations Enhanced**: seed_genres + audio features mood
2. **Search Specifico**: `genre:"electronic" EDM`
3. **Recommendations Basic**: solo seeds genere
4. **Search Generico**: solo `genre:"electronic"`

#### Algoritmo Scoring:
```javascript
// FILTRO GENERE OBBLIGATORIO
if (!checkGenreMatch(track, requestedGenre)) return { score: 0 };

// SCORING
score += 50; // Bonus genere corretto
score += sourceWeights[track.source]; // 30-100 punti
score += moodBonus; // 8-20 punti
score += popularity * 0.15; // Peso minimo
if (popularity > 85) score -= 20; // Penalità mainstream
```

### 5. GENERAZIONE PLAYLIST
Funzione separata che genera playlist di 15 canzoni basata sulla canzone selezionata:
- Track-based recommendations (se disponibile ID)
- Artist-based recommendations  
- Genre-based recommendations
- Search fallback

### 6. UI/UX REQUIREMENTS

#### Design System:
- **Colori**: Bianco, nero, grigi, accent colors per stati
- **Font**: System fonts, 3 pesi massimo
- **Spacing**: Sistema 8px
- **Componenti**: Rounded corners (12-24px), shadows sottili

#### Animazioni:
- Loading con cerchi concentrici animati
- Barre audio animate durante analisi
- Hover states su tutti i bottoni
- Transizioni smooth (200-500ms)

#### Layout:
- Centrato verticalmente e orizzontalmente
- Responsive (mobile-first)
- Progress bar per quiz
- Cards con shadow per contenuti

#### Stati dell'app:
1. **Quiz**: Domande con opzioni cliccabili
2. **Analyzing**: Loading animato con testo dinamico
3. **Result**: Canzone + spiegazione + azioni
4. **Playlist**: Lista 15 canzoni con player links
5. **Error**: Gestione errori con retry

### 7. FUNZIONALITÀ INTERATTIVE
- **Apri su Spotify**: Link diretto alla canzone
- **Non mi piace, altra!**: Retry con più casualità
- **Genera Playlist**: 15 canzoni correlate
- **Nuovo Quiz**: Reset completo
- **Nuova Playlist**: Rigenera playlist diversa

## STRUTTURA FILE RICHIESTA

```
/
├── public/
│   └── index.html (con Tailwind CDN)
├── src/
│   ├── index.js
│   └── App.js (componente unico)
├── netlify/
│   └── functions/
│       └── spotify.js
├── netlify.toml
└── package.json
```

## DETTAGLI IMPLEMENTAZIONE

### Netlify Function (spotify.js):
- Gestisce sia ricerca singola che generazione playlist
- Parametro `action=generate_playlist` per playlist
- Client Credentials Flow per token
- Gestione errori completa
- CORS headers

### React App (App.js):
- Componente unico con useState per gestione stato
- Chiamate a `/.netlify/functions/spotify`
- Gestione errori e retry
- UI responsive con Tailwind

### Configurazione:
- `netlify.toml` con redirects per functions
- `package.json` con dipendenze corrette
- Build command: `npm run build`

## COMPORTAMENTO ATTESO
1. Utente completa quiz → Analisi animata → Canzone perfetta mostrata
2. Spiegazione intelligente del perché quella canzone
3. Link Spotify funzionante
4. Possibilità retry per varietà
5. Generazione playlist correlata
6. **ZERO canzoni di generi diversi da quello scelto**

## NOTE CRITICHE
- **Genere = discriminante obbligatoria** (mai violata)
- **Popolarità ≠ priorità** (mood + genere > mainstream)
- **Retry = più casualità** (non sempre stessa canzone)
- **UI pulita** (stile Apple/Spotify)
- **Performance** (loading < 3 secondi)

Implementa esattamente queste specifiche per ottenere un Music Matcher perfetto! 🎵