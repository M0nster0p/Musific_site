console.log("js linked")

async function getSongs() {

    try {
        let a = await fetch("http://127.0.0.1:3000/Musific/test/");
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
    let audio = new Audio("/test/" + track)
    audio.play();
}


async function main() {

    let currentSong;

    let songs = await getSongs();
    console.log(songs);

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="albumimg" src="/Musific/assets/hplay.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div></div>
                                </div>
                                <img src="/Musific/assets/play.svg" alt="">
                            </div>

        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML )
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
}



main();