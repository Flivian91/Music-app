// Declare variables
const playPauseBtn = document.querySelector(".play-pause");
const repeatBtn = document.querySelector(".repeat");
const likeBtn = document.querySelector(".like");
const addToPlaylistBtn = document.querySelector(".add-to-playlist");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.getElementById("volume");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const songListEl = document.querySelector(".songs-list-row");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const previousBtn = document.querySelector(".play-previous");
const nextBtn = document.querySelector(".play-next");

// Current song elements
const currentCover = document.getElementById("current-cover");
const currentTitle = document.getElementById("current-title");
const currentArtist = document.getElementById("current-artist");
const songTitle = document.querySelector(".song-title");

// Audio object
let audio = new Audio();
audio.volume = volumeSlider.value;
playPauseBtn.addEventListener("click", () => {
  console.log("Mimi ni eugine");
});

// State variables
let isPlaying = false;
let isRepeating = false;
let currentTrack = null; // To store the current track URL
let totalTIme = 0;
let count = 0;
let allSongs = {
  songs: [],
};

// Fetch songs from Jamendo API
async function fetchSongs(query = "set it") {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=a4f982d6&format=jsonpretty&limit=10&search=${query}`
    );
    const data = await response.json();
    console.log(data.results);
    displaySongs(data.results);
    allSongs.songs.push(data.results);
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Next button
function nextMusic(songs) {
  count++;
  if (count > 9) {
    count = 0;
  }
  console.log(count);
  
  const song = allSongs.songs[count];
  console.log(allSongs.songs[4]);
  playTrack();
}
nextBtn.addEventListener("click", nextMusic);

// Display the list of songs
function displaySongs(songs) {
  songListEl.innerHTML = "";
  songs.forEach((song) => {
    const listItem = document.createElement("li");
    listItem.classList.add("song-item");
    listItem.innerHTML = `
      <button title="play" data-url="${song.id}" class="control-btn play-btn">
        <i class="fa fa-pause-circle-o" aria-hidden="true"></i>
      </button>
      <p>${song.artist_name}</p>
      <p>${song.name}</p>
      <div class="songs-action">
        <button class="control-btn like">
          <i class="fa fa-heart" aria-hidden="true"></i>
        </button>
        <button class="control-btn download">
          <i class="fa fa-download" aria-hidden="true"></i>
        </button>
      </div>
    `;
    songListEl.appendChild(listItem);
  });

  // Add event listeners to play buttons
  document.querySelectorAll(".play-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const songData = songs.find((song) => song.id === button.dataset.url);
      setCurrentTrack(songData);
      playTrack();
    });
  });
}

// Set the current track
function setCurrentTrack(data) {
  currentTrack = data.audio;
  audio.src = data.audio;
  audio.load();
  songTitle.textContent = `${data.name}`; // Display track name
  currentArtist.textContent = `${data.artist_name}`; // Set artist name if available
  currentCover.src = `${data.album_image}`;
}

// Play the current track
function playTrack() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML =
      ' <i class="fa fa-pause-circle-o" aria-hidden="true"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
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
  totalTIme = formatTime(duration);
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
