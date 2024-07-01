console.log("lets write");
let currentSong=new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder){
    currfolder=folder;
    let a=await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response=await a.text();
    let div=document.createElement("div")
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
   songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        } 
    }

    let songsUL=document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songsUL.innerHTML=""
    for (const song of songs) {
        songsUL.innerHTML=songsUL.innerHTML+`<li> 
        <img class="invert" src="music-svgrepo-com.svg" alt="">
                       <div class="info">
                         <div>${song.replaceAll("%20"," ")}</div>
                         <div>Aman</div>
                       </div>
                       <div class="playnow">
                         <span>play now</span>
                         <img class="invert" src="play.svg" alt="">
                       </div>
        
        </li>`;
    }
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
           
    })

}
const playMusic=(track, pause=false)=>{
    currentSong.src=`/${currfolder}/`+track;
    if(!pause){
        currentSong.play();
        play.src="pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00/00:00"

   

}
async function displayAlbums(){
    let a=await fetch(`http://127.0.0.1:5500/songs/`)
    let response=await a.text();
    let div=document.createElement("div")
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardcontainer=document.querySelector(".cardcontainer")
    Array.from(anchors).forEach(async e=>{
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]

            let a=await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response=await a.json();
    cardcontainer.innerHTML=cardcontainer.innerHTML+`<div  data-folder="${folder}" class="card">
                    <div class="play">
                        <svg widht="16" height="16" viewbox="0 0 24 24" fill="none"
                        xlmns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-widht="1.5"
                        stroke-linejoin="round"/>
                    </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    })
}
async function main(){
    
 await getsongs("songs/ncs")
    playMusic(songs[0],true)


    displayAlbums()
    
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="pause.svg"
        }
        else{
            currentSong.pause()
            play.src="play.svg"
        }
    })
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%";
    })
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent+"%";
        currentSong.currentTime=((currentSong.duration)*percent)/100;
    })
    
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })
    previous.addEventListener("click",()=>{
        currentSong.pause();
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentSong.pause();
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100
    })
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs=await getsongs(`songs/${item.currentTarget.dataset.folder}`)
           
        })
    })
}
main()