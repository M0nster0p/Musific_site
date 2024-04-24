console.log("js linked")
let currentSong = new Audio();

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
        let songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            // Modify filter condition based on your song link format
            if (element.href.endsWith(".m4a")) {
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

const playMusic = (track)=>{
    currentSong.src="/test/" + track;
    currentSong.play();
    play.src = "/assets/pause.svg"
    document.querySelector(".songinfo").innerHTML = track;
    currentSong.volume = 0.25;
}




async function main() {


    let songs = await getSongs();
    console.log(songs);

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

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML )
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "/assets/pause.svg"
        }
        else{
            currentSong.pause();
            play.src = "/assets/play.svg"
        }
    })
}



main();