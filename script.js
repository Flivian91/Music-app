// Declare variables for DOM elements
const playPauseBtn = document.querySelector(".play-pause"); // Play/Pause button
const repeatBtn = document.querySelector(".repeat"); // Repeat button
const likeBtn = document.querySelector(".like"); // Like button
const addToPlaylistBtn = document.querySelector(".add-to-playlist"); // Add to playlist button
const progressBar = document.getElementById("progress-bar"); // Progress bar for the current track
const volumeSlider = document.getElementById("volume"); // Volume slider
const currentTimeEl = document.getElementById("current-time"); // Current playback time
const totalTimeEl = document.getElementById("total-time"); // Total track duration
const songListEl = document.querySelector(".songs-list-row"); // List of songs
const searchForm = document.getElementById("search-form"); // Search form for songs
const searchInput = document.getElementById("search-input"); // Input field for search
const previousBtn = document.querySelector(".play-previous"); // Previous track button
const nextBtn = document.querySelector(".play-next"); // Next track button

// Elements for displaying current song information
const currentCover = document.getElementById("current-cover"); // Current song's cover image
const currentTitle = document.getElementById("current-title"); // Current song's title
const currentArtist = document.getElementById("current-artist"); // Current song's artist
const songTitle = document.querySelector(".song-title"); // Song title display area

// Audio object for playing songs
let audio = new Audio();
audio.volume = volumeSlider.value; // Set initial volume to slider value


// State variables for managing playback and UI
let isPlaying = false; // Playback state
let isRepeating = false; // Repeat mode state
let currentTrack = null; // Currently playing track URL
let totalTIme = 0; // Total playback duration (formatted)
let count = 0; // Counter for additional logic (if needed)
let allSongs = { songs: [] }; // Store all fetched songs
let currentSongIndex = 0; // Index of the currently playing song

// Fetch songs from Jamendo API
async function fetchSongs(query = "") {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=a4f982d6&format=jsonpretty&limit=10&search=${query}`
    );
    const data = await response.json();
    displaySongs(data.results); // Display fetched songs
    allSongs.songs.push(data.results); // Store fetched songs
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Function to play the next track
function nextMusic() {
  currentSongIndex++;
  if (currentSongIndex >= allSongs.songs[0].length) {
    currentSongIndex = 0; // Loop back to the first song
  }
  const song = allSongs.songs[0][currentSongIndex];
  setCurrentTrack(song);
  playTrack();
}
nextBtn.addEventListener("click", nextMusic); // Attach event listener to Next button

// Function to play the previous track
function previousMusic() {
  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = allSongs.songs[0].length - 1; // Loop back to the last song
  }
  const song = allSongs.songs[0][currentSongIndex];
  setCurrentTrack(song);
  playTrack();
}
previousBtn.addEventListener("click", previousMusic); // Attach event listener to Previous button

// Display the list of songs
function displaySongs(songs) {
  songListEl.innerHTML = ""; // Clear existing songs
  songs.forEach((song) => {
    const listItem = document.createElement("li");
    listItem.classList.add("song-item"); // Style the song item
    listItem.innerHTML = `
      <button title="play" data-url="${song.id}" class="control-btn play-btn">
        <i class="fa fa-pause-circle-o" aria-hidden="true"></i>
      </button>
      <p>${song.artist_name}</p>
      <p>${song.name}</p>
      <div class="songs-action">
        <button class="control-btn download" data-url="${song.audio}">
          <i class="fa fa-download" aria-hidden="true"></i>
        </button>
      </div>
    `;
    songListEl.appendChild(listItem); // Add song to the list
  });

  // Add event listeners to play buttons
  document.querySelectorAll(".play-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const songData = songs.find((song) => song.id === button.dataset.url);
      setCurrentTrack(songData);
      playTrack();
    });
  });

  // Add event listeners to download buttons
  document.querySelectorAll(".download").forEach((button) => {
    button.addEventListener("click", (e) => {
      const audioUrl = e.target.closest("button").dataset.url;
      downloadSong(audioUrl);
    });
  });
}

// Set the current track for playback
function setCurrentTrack(data) {
  currentTrack = data.audio;
  audio.src = data.audio; // Set audio source
  audio.load(); // Load the new track
  songTitle.textContent = `${data.name}`; // Update song title
  currentArtist.textContent = `${data.artist_name}`; // Update artist name
  currentCover.src = `${data.album_image}`; // Update album cover
}

// Play or pause the current track
function playTrack() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML =
      '<i class="fa fa-pause-circle-o" aria-hidden="true"></i>'; // Update to Pause icon
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>'; // Update to Play icon
  }
  isPlaying = !audio.paused; // Update playback state
}

// Search functionality
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form submission
  const query = searchInput.value.trim();
  if (query) {
    fetchSongs(query); // Fetch songs based on search query
  }
});

// Toggle play/pause
playPauseBtn.addEventListener("click", playTrack);

// Toggle repeat mode
repeatBtn.addEventListener("click", () => {
  isRepeating = !isRepeating; // Toggle repeat state
  audio.loop = isRepeating; // Set loop property
  repeatBtn.classList.toggle("active", isRepeating); // Update UI
});

// Toggle like button state
likeBtn.addEventListener("click", () => {
  likeBtn.classList.toggle("liked");
  likeBtn.innerHTML = likeBtn.classList.contains("liked")
    ? '<i class="fa fa-thumbs-up fa-thumbs-o-up" aria-hidden="true"></i>'
    : '<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
});

// Add to playlist button (placeholder functionality)
addToPlaylistBtn.addEventListener("click", () => {
  alert("Added to playlist!");
});

// Adjust volume based on slider input
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Update progress bar and display current/total time
audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration;
  progressBar.value = (currentTime / duration) * 100; // Update progress bar
  currentTimeEl.textContent = formatTime(currentTime); // Display current time
  totalTimeEl.textContent = formatTime(duration); // Display total time
  totalTIme = formatTime(duration);
});

// Function to download a song
function downloadSong(url) {
  const link = document.createElement("a");
  link.href = url;
  link.download = url.split("/").pop(); // Set filename based on URL
  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link); // Clean up
}

// Seek through the track using the progress bar
progressBar.addEventListener("input", () => {
  const duration = audio.duration;
  audio.currentTime = (progressBar.value / 100) * duration; // Seek to new position
});

// Helper function to format time (MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0"); // Pad seconds with a leading zero
  return `${minutes}:${secs}`;
}

// Initial fetch for popular songs
fetchSongs();
