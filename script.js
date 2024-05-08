console.log("js linked");
let currentSong = new Audio();
let songs = []; // Declare songs as a global variable

async function getSongs() {
    try {
        let a = await fetch("http://127.0.0.1:3000/test/");
        let respond = await a.text();

        // Check if response is successful
        if (!a.ok) {
            throw new Error(`Server responded with status: ${a.status}`);
        }

        let div = document.createElement("div");
        div.innerHTML = respond;

        let as = div.getElementsByTagName("a");
        songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            // Modify filter condition based on your song link format
            if (element.href.endsWith(".m4a")) {
                songs.push(element.href.split("/test/")[1]);
            }
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split("/test/")[1]);
            }
        }

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        // Handle the error here, maybe display a message to the user
        return [];  // Return empty array in case of error
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = "/test/" + track;
    if (!pause) {
        currentSong.play();
        play.src = "/assets/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    // currentSong.volume = 0.25;
}

// Update duration and remaining time
currentSong.addEventListener("loadedmetadata", () => {
    const duration = currentSong.duration;
    document.querySelector(".durationOfSong").innerHTML = formatTime(duration);
    updateRemainingTime();
});

currentSong.addEventListener("timeupdate", () => {
    updateRemainingTime();
});

// Function to play the next song
const playNextSong = () => {
    // Get the index of the current song
    const currentIndex = songs.findIndex(song => currentSong.src.includes(song));

    // Calculate the index of the next song, looping back to the beginning if necessary
    const nextIndex = (currentIndex + 1) % songs.length;

    // Play the next song
    playMusic(songs[nextIndex]);
}

// Function to play the previous song
const playPreviousSong = () => {
    // Get the index of the current song
    const currentIndex = songs.findIndex(song => currentSong.src.includes(song));

    // Calculate the index of the previous song, looping back to the end if necessary
    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;

    // Play the previous song
    playMusic(songs[previousIndex]);
}

function updateRemainingTime() {
    const currentTime = currentSong.currentTime;
    const duration = currentSong.duration;
    const remainingTime = duration - currentTime;
    const formattedRemainingTime = formatTime(remainingTime);
    document.querySelector(".countUptpDuration").innerHTML = formatTime(duration - Math.ceil(remainingTime)) || "0:00";
    document.querySelector(".circle img").style.right = (remainingTime / duration) * 100 + "%";
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

async function main() {
    await getSongs(); // Fetch songs and populate the global songs array
    console.log(songs);
    playMusic(songs[0], true);

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="albumimg" src="/assets/hplay.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div></div>
                                </div>
                                <img src="/assets/play.svg" alt="play now">
                            </div>

            </li>`;
    }

    // Volume bar integration
    const volumeBar = document.getElementById('volume-bar');
    const volumeFill = document.getElementById('volume-fill');
    const volumeHandle = document.getElementById('volume-handle');

    // Set initial volume
    let volume = currentSong.volume;
    volumeFill.style.width = (volume * 100) + '%';
    volumeHandle.style.left = (volumeBar.offsetWidth * volume - volumeHandle.offsetWidth / 2) + 'px';

    // Update volume on click and drag
    volumeHandle.addEventListener('mousedown', function (event) {
        event.preventDefault();
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleRelease);
    });

    function handleMove(event) {
        let newVolume = (event.clientX - volumeBar.getBoundingClientRect().left) / volumeBar.offsetWidth;
        if (newVolume < 0) {
            newVolume = 0;
        } else if (newVolume > 1) {
            newVolume = 1;
        }
        volume = newVolume;

        // Update volume fill width and volume handle position
        const volumeFillWidth = volume * volumeBar.offsetWidth;
        volumeFill.style.width = volumeFillWidth + 'px';
        volumeHandle.style.left = (volumeFillWidth - volumeHandle.offsetWidth / 2) + 'px';

        currentSong.volume = volume; // Update volume of the audio element

        // Update volume bar value (optional)
        // volumeBar.value = volume * 100;
    }


    function handleRelease() {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleRelease);
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/assets/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "/assets/play.svg"
        }
    });

    // Automatically play the next song when the current one ends
    currentSong.addEventListener("ended", () => {
        playNextSong();
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle img").style.right = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Keyboard media controls
    document.addEventListener('keydown', handleMediaControls);

    function handleMediaControls(event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'ArrowLeft':
                    playPreviousSong(); // Play the previous song
                    break;
                case 'ArrowRight':
                    playNextSong(); // Play the next song
                    break;
                case 'ArrowUp':
                    currentSong.volume = Math.min(1, currentSong.volume + 0.1); // Increase volume by 10%
                    updateVolumeBar();
                    break;
                case 'ArrowDown':
                    currentSong.volume = Math.max(0, currentSong.volume - 0.1); // Decrease volume by 10%
                    updateVolumeBar();
                    break;
                default:
                    break;
            }
        } else {
            switch (event.key) {
                case 'ArrowLeft':
                    currentSong.currentTime -= 10; // Rewind 10 seconds
                    break;
                case 'ArrowRight':
                    currentSong.currentTime += 10; // Fast forward 10 seconds
                    break;
                case ' ':
                    event.preventDefault(); // Prevent scrolling on space key
                    if (currentSong.paused) {
                        currentSong.play();
                        play.src = "/assets/pause.svg";
                    } else {
                        currentSong.pause();
                        play.src = "/assets/play.svg";
                    }
                    break;
                default:
                    break;
            }
        }


    }

    // Function to update the volume bar
    function updateVolumeBar() {
        // Update volume bar
        volumeFill.style.width = (currentSong.volume * 100) + '%';
        volumeHandle.style.left = (volumeBar.offsetWidth * currentSong.volume - volumeHandle.offsetWidth / 2) + 'px';
        volumeBar.value = currentSong.volume * 100;
    }

    let isMenuOpen = false;

    document.querySelector(".more").addEventListener("click", () => {
        const leftMenu = document.querySelector(".left");

        if (!isMenuOpen) {
            leftMenu.style.left = 0;
        } else {
            leftMenu.style.left = -50 + "%";
        }

        isMenuOpen = !isMenuOpen;
    });

}

main();
