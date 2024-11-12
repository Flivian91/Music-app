// Existing elements
const playPauseBtn = document.querySelector(".play-pause");
const repeatBtn = document.querySelector(".repeat");
const likeBtn = document.querySelector(".like");
const addToPlaylistBtn = document.querySelector(".add-to-playlist");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.getElementById("volume");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const songListEl = document.getElementById("song-list");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

// Current song elements
const currentCover = document.getElementById("current-cover");
const currentTitle = document.getElementById("current-title");
const currentArtist = document.getElementById("current-artist");
const songTitle = document.querySelector(".song-title");

// Audio object
let audio = new Audio();
audio.volume = volumeSlider.value;

// State variables
let isPlaying = false;
let isRepeating = false;
let currentTrack = null; // To store the current track URL

// Fetch songs from Jamendo API
async function fetchSongs(query = "") {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=a4f982d6&format=jsonpretty&limit=10&search=${query}`
    );
    const data = await response.json();
    displaySongs(data.results);
    console.log(data.results);
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Display the list of songs
function displaySongs(songs) {
  songListEl.innerHTML = "";
  songs.forEach((song) => {
    const listItem = document.createElement("li");
    listItem.classList.add("song-item");
    listItem.innerHTML = `
      <span>${song.name} - ${song.artist_name}</span>
      <button class="play-btn" data-url="${song.id}">Play</button>
    `;
    songListEl.appendChild(listItem);
  });

  // Add event listeners to play buttons
  document.querySelectorAll(".play-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const songData = songs.find(song => song.id === button.dataset.url)      
      
      setCurrentTrack(songData);
      playTrack();
    });
  });
}

// Set the current track
function setCurrentTrack(data) {
  console.log(data);
  
  currentTrack = data.audio;
  audio.src = data.audio;
  audio.load();
  songTitle.textContent = `${data.name}`; // Display track name 
  currentArtist.textContent = `${data.artist_name}` // Set artist name if available
  currentCover.src = `${data.album_image}`
}

// Play the current track
function playTrack() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
  isPlaying = !audio.paused;
}

// Search functionality
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchSongs(query);
  }
});

// Play/Pause Toggle
playPauseBtn.addEventListener("click", playTrack);

// Repeat Toggle
repeatBtn.addEventListener("click", () => {
  isRepeating = !isRepeating;
  audio.loop = isRepeating;
  repeatBtn.classList.toggle("active", isRepeating);
});

// Like Button (Visual Feedback Only)
likeBtn.addEventListener("click", () => {
  likeBtn.classList.toggle("liked");
  likeBtn.textContent = likeBtn.classList.contains("liked") ? "Liked" : "Like";
});

// Add to Playlist (Visual Feedback Only)
addToPlaylistBtn.addEventListener("click", () => {
  alert("Added to playlist!");
});

// Volume Control
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Update Progress Bar and Time Display
audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration;
  progressBar.value = (currentTime / duration) * 100;
  currentTimeEl.textContent = formatTime(currentTime);
  totalTimeEl.textContent = formatTime(duration);
});

// Seek Audio
progressBar.addEventListener("input", () => {
  const duration = audio.duration;
  audio.currentTime = (progressBar.value / 100) * duration;
});

// Format Time Helper Function
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
}

// Initial fetch for popular songs
fetchSongs();
