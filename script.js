const GameBoard = (() =>{
    let gameboard = ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    let players = {player1: "", player2: ""};
    const addPlayer = (player) => {
        if(players.player1 == ""){
            players.player1 = player;
            player.setPlayerNumber(1);
        }
        else if(players.player2 == ""){
            players.player2 = player;
            player.setPlayerNumber(2);
        }
        console.log(players);
    };
    const getPlayers = () => {
        return [players.player1, players.player2];
    }
    const deletePlayer = (index) =>{
        if(index){
            players.player2 = "";
        }
        else{
            players.player1 = players.player2;
            players.player2 = "";
        }
    };
    const updateBoard = (move) =>{
        gameboard[move] = move;
        console.log(gameboard);
    };
    events.on('addPlayer', addPlayer);
    events.on('deletePlayer', deletePlayer);
    events.on('moveMade', updateBoard);

    return{getPlayers};
})();

const Player = (name) => {
    const getName = () => name;
    const placeMarker = place =>{
        events.emit('moveMade', place);
    };
    const setPlayerNumber = (index) =>{
        this.playerNumber = index;
    }
    return {getName, setPlayerNumber, placeMarker};
};

const gameFlow = (() =>{

})();
const displayController = (() =>{

})();


const PlayerDisplay = (() =>{
    const addBtn = document.querySelector("#add-player");
    const nameBtn = document.querySelector("#name-input");
    const players = document.getElementById("players");
    addBtn.addEventListener("click", function(){
        let value = nameBtn.value;
        if(value !== ""){
            const newPlayer = Player(value);
            // GameBoard.addPlayer(newPlayer);
            events.emit("addPlayer", newPlayer);
            display();
        }
    });
    const display = () => {
            deleteDisplay();
            let currentPlayers = GameBoard.getPlayers();
            currentPlayers.forEach((element, index)=> {
                console.log(typeof element);
                let playerCount = 1;
                if(typeof element == "object"){
                    let id = "player-" + (playerCount + index);
                    let label = document.createElement("label");
                        label.setAttribute("for", id);
                        label.innerText = "Player " + (playerCount + index) + ":";
                    if(index){
                        label.style.color = "blue";
                    }
                    else{
                        label.style.color = "red";
                    }
                    let li = document.createElement("li");
                        li.setAttribute("id", id);
                        li.player = index;
                    let span = document.createElement("span");
                    span.innerText = element.getName();
                    li.appendChild(span);
                    if(index){
                        li.innerHTML+= `
                        <svg  viewBox="0 0 24 24" class="rmBtn">
                            <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>`;
                    }
                    else{
                        li.innerHTML+= `
                            <svg  viewBox="0 0 24 24" class="rmBtn">
                                <path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" />
                            </svg>`;
                    }
                    players.appendChild(label);
                    players.appendChild(li);
                    removeBtnCreation(index);
                }
            });
    };
    const deleteDisplay = () => {
        let children = Array.from(players.children);
        children.forEach((child) =>{
            players.removeChild(child);
        });

    };
    const removeBtnCreation = (index) => {
        const removeBtn = Array.from(document.querySelectorAll(".rmBtn"));
        let btn = removeBtn[index];
        btn.addEventListener("click", function(){
            let li = btn.parentElement;
            // GameBoard.deletePlayer(li.player);
            events.emit('deletePlayer', li.player);
            display();
        });
    };
})();